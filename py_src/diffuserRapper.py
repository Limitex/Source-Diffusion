import time
import torch
from diffusers import StableDiffusionPipeline
from diffusers.models import AutoencoderKL
from py_src.apiModel import GenerateContainer

global pipe
def load(model_path, vae_path, torch_dtype):
    global pipe
    print('start model load.')
    load_time = time.time()
    pipe = StableDiffusionPipeline.from_pretrained(
        pretrained_model_name_or_path = model_path,
        torch_dtype = torch_dtype,
        vae=AutoencoderKL.from_pretrained(
            pretrained_model_name_or_path = vae_path, 
            torch_dtype = torch_dtype
        ),
    ).to("cuda")
    pipe.safety_checker = lambda images, **kwargs: (images, False)
    pipe.enable_attention_slicing()
    time_load = time.time() - load_time
    print(f"Models loaded in {time_load:.2f}s")

def generate(gc: GenerateContainer):
    global pipe
    return pipe(
        prompt=gc.positive,
        height=gc.height,
        width=gc.width,
        num_inference_steps=gc.steps,
        guidance_scale=gc.scale,
        negative_prompt=gc.negative,
        num_images_per_prompt=gc.num,
        eta=gc.eta,
        generator= None if gc.seed == -1 else torch.manual_seed(gc.seed),
    ).images