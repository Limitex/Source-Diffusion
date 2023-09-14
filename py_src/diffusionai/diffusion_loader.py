import os
import re
import torch
import shutil

from enum import Enum
from collections import Counter
from safetensors.torch import load_file
from diffusers import StableDiffusionPipeline, AutoencoderKL

from .convert_vae_pt_to_diffusers import vae_pt_to_vae_diffuser
from .diffusion_error import ModelFormatError, ModelIdentificationError, ModelLoadError


class LoadModelType(Enum):
    SD_model_Diffusers      = 'Stable Diffusion Model (Diffusers Model)'
    SD_model_Safetensors    = 'Stable Diffusion Model (Safetensors Model)'
    SD_model_Ckpt           = 'Stable Diffusion Model (CKPT Model)'
    VAE_model_Diffusers     = 'Stable Diffusion Vae (Diffusers Model)'
    VAE_model_Pt            = 'Stable Diffusion Vae (PT Model)'
    LORA_model_Safetensors  = 'Stable Diffusion Lora (Safetensors Model)'
    HuggingFace             = 'Huggingface Repository Path'


class ModelType(Enum):
    SD_model = 'Stable Diffusion Model'
    VAE_model = 'Stable Diffusion Vae'
    LORA_model = 'Stable Diffusion Lora'


class BaseLoader():
    def __init__(self, dtype: torch.dtype = torch.float16, cache: str = './cache') -> None:
        self.dtype = dtype
        self.cache = cache
        self.basename = None
        self.basetype = None
        os.makedirs(cache, exist_ok=True)
    
    def determine_model_from_file(self, model_path: str) -> LoadModelType:
        def __logger(lmt: LoadModelType) -> LoadModelType:
            print(f'The model loaded was \"{lmt.value}\".')
            return lmt
        print('Determining model.')
        if os.path.isfile(model_path):
            _, ext = os.path.splitext(model_path)
            if ext == '.safetensors':
                dict = load_file(model_path)
                if any('diffusion_model' in key for key in dict.keys()):
                    return __logger(LoadModelType.SD_model_Safetensors)
                elif any('lora_unet' in key for key in dict.keys()):
                    return __logger(LoadModelType.LORA_model_Safetensors)
            elif ext == '.ckpt':
                return __logger(LoadModelType.SD_model_Ckpt)
            elif ext == '.pt':
                return __logger(LoadModelType.VAE_model_Pt)
        elif os.path.isdir(model_path):
            vlist = ['config.json', 'diffusion_pytorch_model.safetensors']
            flist = os.listdir(model_path)
            if Counter(flist) == Counter(vlist):
                return __logger(LoadModelType.VAE_model_Diffusers)
            else:
                return __logger(LoadModelType.SD_model_Diffusers)
        elif re.fullmatch(r'^([^/]*?)/([^/]*?)$', model_path):
            return __logger(LoadModelType.HuggingFace)
        raise ValueError('The specified argument is malformed.')

    def remove_model(self, model_path:str) -> (str, ModelType):
        model_type = self.determine_model_from_file(model_path)

        if model_type != LoadModelType.HuggingFace:
            cache_path = os.path.abspath(self.cache)
            target_path = os.path.abspath(model_path)
            if not os.path.commonprefix([target_path, cache_path]) == cache_path:
                raise ValueError('The specified path does not exist in the cache directory.')

        if model_type in [LoadModelType.SD_model_Diffusers, LoadModelType.VAE_model_Diffusers]:
            shutil.rmtree(model_path)
        elif model_type in [LoadModelType.SD_model_Safetensors,
                            LoadModelType.LORA_model_Safetensors,
                            LoadModelType.SD_model_Ckpt,
                            LoadModelType.VAE_model_Pt]:
            os.remove(model_path)
        elif model_type == LoadModelType.HuggingFace:
            names = model_path.split('/')
            shutil.rmtree(os.path.join(self.cache, f'models--{names[0]}--{names[1]}'))
        else:
            raise ModelIdentificationError('Could not identify type of model to delete.')
        return model_path

    def set_model(self, model_path: str) -> (str, ModelType):
        pass

    def get_path(self):
        return self.basename
    
    def get_type(self):
        return self.basetype


class DiffusionModelLoader(BaseLoader):
    def __model_cacher(self, model_path: str) -> str:
        path = os.path.join(self.cache, os.path.basename(model_path) + '_from_file')
        pipe = StableDiffusionPipeline.from_single_file(
            pretrained_model_link_or_path=model_path,
            torch_dtype=self.dtype,
            cache_dir=self.cache
        )
        pipe.save_pretrained(
            save_directory=path, 
            safe_serialization=True
        )
        return path

    def __model_check_and_buffer(self, model_path: str) -> bool:
        try:
            pipe = StableDiffusionPipeline.from_pretrained(
                pretrained_model_name_or_path=model_path,
                torch_dtype=self.dtype,
                cache_dir=self.cache)
        except:
            return False
        return True

    def set_model(self, model_path: str) -> (str, ModelType):
        modelType = super().determine_model_from_file(model_path)
        if not modelType in [LoadModelType.SD_model_Ckpt,
                             LoadModelType.SD_model_Safetensors,
                             LoadModelType.SD_model_Diffusers,
                             LoadModelType.HuggingFace]:
            raise ModelFormatError('The specified model is not a Diffusion model.')

        if modelType in [LoadModelType.SD_model_Safetensors, 
                         LoadModelType.SD_model_Ckpt]:
            print('Creating cache from file.')
            self.basename = self.__model_cacher(model_path)
        elif modelType == LoadModelType.SD_model_Diffusers:
            print('Creating cache from Diffusers model.')
            if not self.__model_check_and_buffer(model_path):
                raise ModelLoadError('The specified path could not be loaded as a Diffusion model.')
            path = os.path.join(self.cache, os.path.basename(model_path))
            shutil.copytree(model_path, path)
            self.basename = path
        elif modelType == LoadModelType.HuggingFace:
            print('Creating cache from HuggingFace.')
            if not self.__model_check_and_buffer(model_path):
                raise ModelLoadError('Could not successfully retrieve model from HuggingFace.')
            self.basename = model_path
        
        self.basetype = ModelType.SD_model
        return self.basename, self.basetype


class VaeModelLoader(BaseLoader):
    def __model_checker(self, model_path: str) -> bool:
        try:
            pipe = AutoencoderKL.from_pretrained(
                pretrained_model_name_or_path=model_path,
                torch_dtype=self.dtype,
                cache_dir=self.cache)
        except:
            return False
        return True

    def set_model(self, model_path: str) -> (str, ModelType):
        modelType = super().determine_model_from_file(model_path)
        if not modelType in [LoadModelType.VAE_model_Diffusers, 
                             LoadModelType.VAE_model_Pt]:
            raise ModelFormatError('The specified model is not a Vae model.')
        
        if modelType == LoadModelType.VAE_model_Diffusers:
            print('Creating cache from Diffusers model.')
            if not self.__model_checker(model_path):
                raise ModelLoadError('The specified path could not be loaded as a Vae model.')
            path = os.path.join(self.cache, os.path.basename(model_path))
            shutil.copytree(model_path, path)
            self.basename = path
        elif modelType == LoadModelType.VAE_model_Pt:
            print('Creating cache from pt model.')
            path = os.path.join(self.cache, os.path.basename(model_path) + '_from_file')
            vae_pt_to_vae_diffuser(model_path, path)
            self.basename = path
        self.basetype = ModelType.VAE_model
        return self.basename, self.basetype


class LoraModelLoader(BaseLoader): 
    def set_model(self, model_path: str) -> (str, ModelType):
        modelType = super().determine_model_from_file(model_path)
        if modelType != LoadModelType.LORA_model_Safetensors:
            raise ModelFormatError('The specified model is not a Lora model.')
        print('Copying file to cache.')
        path = os.path.join(self.cache, os.path.basename(model_path))
        shutil.copy(model_path, path)
        self.basename = path
        self.basetype = ModelType.LORA_model
        return self.basename, self.basetype


class AutoModelLoader(BaseLoader):
    def __model_type_convert(self, model_path: str):
        def __logger(mt: ModelType) -> ModelType:
            print(f'The model was classified as \"{mt.value}\".')
            return mt
        modelType = super().determine_model_from_file(model_path)
        print('Broadly classify model types.')
        if modelType in [LoadModelType.SD_model_Ckpt,
                             LoadModelType.SD_model_Safetensors,
                             LoadModelType.SD_model_Diffusers,
                             LoadModelType.HuggingFace]:
            return __logger(ModelType.SD_model)
        elif modelType in [LoadModelType.VAE_model_Diffusers, 
                             LoadModelType.VAE_model_Pt]:
            return __logger(ModelType.VAE_model)
        elif modelType == LoadModelType.LORA_model_Safetensors:
            return __logger(ModelType.LORA_model)
        raise ModelFormatError('The specified model could not be determined.')
        
    def set_model(self, model_path: str) -> (str, ModelType):
        model_type = self.__model_type_convert(model_path)
        print('Loading by model')
        if model_type == ModelType.SD_model:
            self.basename, self.basetype = DiffusionModelLoader(self.dtype, self.cache).set_model(model_path)
        elif model_type == ModelType.VAE_model:
            self.basename, self.basetype = VaeModelLoader(self.dtype, self.cache).set_model(model_path)
        elif model_type == ModelType.LORA_model:
            self.basename, self.basetype = LoraModelLoader(self.dtype, self.cache).set_model(model_path)
        else:
            raise ModelLoadError('Could not load model.')
        print(f'Model loading is complete. It is saved in \"{self.basename}\". The model type is \"{self.basetype.value}\"')
        return self.basename, self.basetype

