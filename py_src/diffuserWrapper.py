import asyncio
import os
import time
import torch
from diffusers import DiffusionPipeline
from diffusers.models import AutoencoderKL
from py_src.lib.apiModel import GenerateStreamInput
from py_src.lib.loadLora import load_safetensors_lora
from py_src.loadModelsConfig import ModelType
from py_src.osPath import get_models_path, get_cache_path
from py_src.lib.token_auto_concat_embeds import token_auto_concat_embeds

global pipe
generate_progress_callback = None
loadedModelId = None
loadedVaeModelId = None
loadedLoraModelId = None


def loadPipeline(modelName, torch_dtype, vaeName=None, loraName=None):
    if vaeName is None:
        pipeline = DiffusionPipeline.from_pretrained(
            pretrained_model_name_or_path=modelName,
            torch_dtype=torch_dtype,
            cache_dir=get_cache_path()
        )
    else:
        pipeline = DiffusionPipeline.from_pretrained(
            pretrained_model_name_or_path=modelName,
            torch_dtype=torch_dtype,
            cache_dir=get_cache_path(),
            vae=AutoencoderKL.from_pretrained(
                pretrained_model_name_or_path=vaeName,
                torch_dtype=torch_dtype,
                cache_dir=get_cache_path(),
            )
        )
    if loraName is not None:
        pipeline = load_safetensors_lora(pipeline, loraName)
    return pipeline.to("cuda")


def load(mtype, modelId, torch_dtype, vaeId=None, loraId=None):
    global pipe, loadedModelId, loadedVaeModelId, loadedLoraModelId
    print('start model load.')
    load_time = time.time()
    if mtype == ModelType.HuggingFace:
        ppath = modelId
    else:
        ppath = os.path.join(get_models_path(), modelId)
    pipe = loadPipeline(
        ppath,
        torch_dtype,
        None if vaeId == None else os.path.join(get_models_path(), vaeId),
        None if loraId == None else os.path.join(get_models_path(), loraId)
    )
    if pipe.safety_checker is not None:
        pipe.safety_checker = lambda images, **kwargs: (images, False)
    pipe.enable_attention_slicing()
    time_load = time.time() - load_time
    loadedModelId = modelId
    loadedVaeModelId = vaeId
    loadedLoraModelId = loraId
    print(f"Models loaded in {time_load:.2f}s")


def TestLoad(path: str, importType: ModelType):
    try:
        if (importType == ModelType.Model or importType == ModelType.HuggingFace):
            pipe = DiffusionPipeline.from_pretrained(
                pretrained_model_name_or_path=path,
                cache_dir=get_cache_path())
            pipe = None
            return True
        elif (importType == ModelType.Vae):
            vae = AutoencoderKL.from_pretrained(
                pretrained_model_name_or_path=path,
                cache_dir=get_cache_path())
            vae = None
            return True
        elif (importType == ModelType.Lora):
            # TODO : Check if lora can be loaded
            return True
        raise
    except:
        return False


def diffusionGenerate_progress_callback(step: int, timestep: int, latents: torch.FloatTensor):
    if generate_progress_callback is not None:
        generate_progress_callback(step, timestep, latents)


async def diffusionGenerate_async(gc: GenerateStreamInput):
    global pipe
    positive_embeds, negative_embeds = token_auto_concat_embeds(pipe, gc.positive, gc.negative)

    seeds = [gc.seed] if gc.seed != -1 else []
    seeds += [torch.randint(0, 2 ** 32, [1]).item() for _ in range(gc.num - len(seeds))]

    images = []
    for seed in seeds:
        images.append(((await asyncio.to_thread(
            pipe,
            prompt_embeds=positive_embeds,
            height=gc.height,
            width=gc.width,
            num_inference_steps=gc.steps,
            guidance_scale=gc.scale,
            negative_prompt_embeds=negative_embeds,
            num_images_per_prompt=1,
            eta=gc.eta,
            generator=torch.manual_seed(seed),
            callback=diffusionGenerate_progress_callback
        )).images[0], seed))

    return (images, gc)