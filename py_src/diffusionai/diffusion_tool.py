import os
import torch
import asyncio

from enum import Enum
from typing import Callable
from pydantic import BaseModel

from .diffusion_error import ModelLoadError
from .token_auto_concat_embeds import token_auto_concat_embeds
from .load_lora_from_safetensors import load_safetensors_lora

from diffusers import (
    StableDiffusionPipeline,
    # DiffusionPipeline,
    AutoencoderKL,
    DDIMScheduler,
    DDPMScheduler,
    DEISMultistepScheduler,
    DPMSolverMultistepScheduler,
    DPMSolverSinglestepScheduler,
    EulerAncestralDiscreteScheduler,
    EulerDiscreteScheduler,
    HeunDiscreteScheduler,
    KDPM2AncestralDiscreteScheduler,
    KDPM2DiscreteScheduler,
    UniPCMultistepScheduler,
)

class Scheduler(Enum):
    DDIM = DDIMScheduler
    DDPM = DDPMScheduler
    DEISMultistep = DEISMultistepScheduler
    DPMSolverMultistep = DPMSolverMultistepScheduler
    DPMSolverSinglestep = DPMSolverSinglestepScheduler
    EulerAncestralDiscrete = EulerAncestralDiscreteScheduler
    EulerDiscrete = EulerDiscreteScheduler
    HeunDiscrete = HeunDiscreteScheduler
    KDPM2AncestralDiscrete = KDPM2AncestralDiscreteScheduler
    KDPM2Discrete = KDPM2DiscreteScheduler
    UniPCMultistep = UniPCMultistepScheduler

class DiffusionImageParameters(BaseModel):
    positive: str
    negative: str
    height: int
    width: int
    steps: int
    scale: float
    num: int
    eta: float
    seed: int

class DiffusionTool:
    def __init__(self, dtype = torch.float16, cache = './cache'):
        self.__pipeline = None
        self.__readypipeline = None
        self.__dtype = dtype
        self.__cache = cache
        self.__basemodel = None
        self.__basevae = None
        self.__baselora = None
        self.__basescheduler = None
        self.__generate_callback = None
        os.makedirs(cache, exist_ok=True)
    
    def set_model(self, model_path: str):
        self.__basemodel = model_path
        self.__pipeline = StableDiffusionPipeline.from_pretrained(
            pretrained_model_name_or_path=self.__basemodel,
            torch_dtype=self.__dtype,
            cache_dir=self.__cache,
        )

    def set_vae(self, model_path: str):
        if self.__pipeline == None:
            raise ModelLoadError('Model not loaded.')
        self.__basevae = model_path
        self.__pipeline.vae = AutoencoderKL.from_pretrained(
            pretrained_model_name_or_path=self.__basevae,
            torch_dtype=self.__dtype,
            cache_dir=self.__cache,
        )

    def set_lora(self, model_path: str):
        if self.__pipeline == None:
            raise ModelLoadError('Model not loaded.')
        self.__baselora = model_path
        load_safetensors_lora(self.__pipeline, self.__baselora)

    def set_scheduler(self, scheduler: Scheduler):
        if self.__pipeline == None:
            raise ModelLoadError('Model not loaded.')
        self.__basescheduler = scheduler.value
        self.__pipeline.scheduler = self.__basescheduler.from_pretrained(
            pretrained_model_name_or_path=self.__basemodel,
            torch_dtype=self.__dtype,
            cache_dir=self.__cache,
            subfolder='scheduler'
        )

    def set_generate_callback(self, callback: Callable):
        """args : [step: int, timestep: int, latents: torch.FloatTensor]"""
        self.__generate_callback = callback
    
    def set_ready(self):
        self.__pipeline.safety_checker = \
            None if self.__pipeline.safety_checker else lambda images, **kwargs: (images, False)
        self.__pipeline.enable_attention_slicing()
        self.__readypipeline = self.__pipeline.to("cuda")
        

    async def generate(self, param: DiffusionImageParameters) -> (list, DiffusionImageParameters):
        if self.__pipeline == None:
            raise ModelLoadError('Model not loaded.')
        if self.__readypipeline == None:
            raise ModelLoadError('The generate function was executed before set_ready was called.')
        positive_embeds, negative_embeds = \
            token_auto_concat_embeds(self.__readypipeline, param.positive, param.negative)
        seeds = [param.seed] if param.seed != -1 else []
        seeds += [torch.randint(0, 2 ** 32, [1]).item() for _ in range(param.num - len(seeds))]
        images = [((await asyncio.to_thread(
            self.__readypipeline,
            prompt_embeds=positive_embeds,
            height=param.height,
            width=param.width,
            num_inference_steps=param.steps,
            guidance_scale=param.scale,
            negative_prompt_embeds=negative_embeds,
            num_images_per_prompt=1,
            eta=param.eta,
            generator=torch.manual_seed(seed),
            callback=self.__generate_callback
        )).images[0], seed) for seed in seeds]
        return (images, param)
