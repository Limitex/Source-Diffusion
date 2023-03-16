import asyncio
import os
import time
import torch
from diffusers import StableDiffusionPipeline
from diffusers.models import AutoencoderKL
from py_src.apiModel import GenerateContainer
from py_src.loadModelsConfig import ModelType
from py_src.osPath import get_models_path, get_cache_path

global pipe
generate_progress_callback = None
loadedModelId = None
loadedVaeModelId = None


def loadPipeline(modelName, torch_dtype, vaeName=None):
    if vaeName is None:
        pipeline = StableDiffusionPipeline.from_pretrained(
            pretrained_model_name_or_path=modelName,
            torch_dtype=torch_dtype,
            cache_dir=get_cache_path()
        )
    else:
        pipeline = StableDiffusionPipeline.from_pretrained(
            pretrained_model_name_or_path=modelName,
            torch_dtype=torch_dtype,
            cache_dir=get_cache_path(),
            vae=AutoencoderKL.from_pretrained(
                pretrained_model_name_or_path=vaeName,
                torch_dtype=torch_dtype,
                cache_dir=get_cache_path(),
            )
        )
    return pipeline.to("cuda")


def load(modelId, torch_dtype, vaeId=None):
    global pipe, loadedModelId, loadedVaeModelId
    print('start model load.')
    load_time = time.time()
    pipe = loadPipeline(
        os.path.join(get_models_path(), modelId),
        torch_dtype,
        None if vaeId == None else os.path.join(get_models_path(), vaeId)
    )
    if pipe.safety_checker is not None:
        pipe.safety_checker = lambda images, **kwargs: (images, False)
    pipe.enable_attention_slicing()
    time_load = time.time() - load_time
    loadedModelId = modelId
    loadedVaeModelId = vaeId
    print(f"Models loaded in {time_load:.2f}s")


def TestLoad(path: str, importType: ModelType):
    try:
        if (importType == ModelType.Model or importType == ModelType.HuggingFace):
            pipe = StableDiffusionPipeline.from_pretrained(
                pretrained_model_name_or_path=path,
                cache_dir=get_cache_path())
            pipe = None
        elif (importType == ModelType.Vae):
            vae = AutoencoderKL.from_pretrained(
                pretrained_model_name_or_path=path,
                cache_dir=get_cache_path())
            vae = None
        return True
    except:
        return False


def diffusionGenerate_progress_callback(step: int, timestep: int, latents: torch.FloatTensor):
    if generate_progress_callback is not None:
        generate_progress_callback(step, timestep, latents)


async def diffusionGenerate_async(gc: GenerateContainer):
    global pipe
    return (await asyncio.to_thread(
        pipe,
        prompt=gc.positive,
        height=gc.height,
        width=gc.width,
        num_inference_steps=gc.steps,
        guidance_scale=gc.scale,
        negative_prompt=gc.negative,
        num_images_per_prompt=gc.num,
        eta=gc.eta,
        generator=None if gc.seed == -1 else torch.manual_seed(gc.seed),
        callback=diffusionGenerate_progress_callback
    )).images
