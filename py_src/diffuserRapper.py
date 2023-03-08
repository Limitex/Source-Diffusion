import asyncio
import os
import time
import torch
from diffusers import StableDiffusionPipeline
from diffusers.models import AutoencoderKL
from py_src.apiModel import GenerateContainer

global pipe
generate_progress_callback = None
loadedModelName = ''
loadedVaeModelName = ''

def load(userDataPath, modelDirName, vaeDirName, torch_dtype):
    global pipe, loadedModelName, loadedVaeModelName
    print('start model load.')
    load_time = time.time()
    pipe = StableDiffusionPipeline.from_pretrained(
        pretrained_model_name_or_path = os.path.join(userDataPath, modelDirName),
        torch_dtype = torch_dtype,
        vae=AutoencoderKL.from_pretrained(
            pretrained_model_name_or_path = os.path.join(userDataPath, vaeDirName), 
            torch_dtype = torch_dtype
        ),
    ).to("cuda")
    pipe.safety_checker = lambda images, **kwargs: (images, False)
    pipe.enable_attention_slicing()
    time_load = time.time() - load_time
    loadedModelName = modelDirName
    loadedVaeModelName = vaeDirName
    print(f"Models loaded in {time_load:.2f}s")

def diffusionGenerate_progress_callback(step :int, timestep :int, latents :torch.FloatTensor):
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
        generator= None if gc.seed == -1 else torch.manual_seed(gc.seed),
        callback=diffusionGenerate_progress_callback
    )).images