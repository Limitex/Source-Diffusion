import os

from py_src.loadModelsConfig import ModelType


def determine_model_type(path):
    # TODO : Fix code that is likely to have bugs
    diffusers_required = [
        'feature_extractor',
        'safety_checker',
        'scheduler',
        'text_encoder',
        'tokenizer',
        'unet',
        'vae',
        'model_index.json'
    ]
    vae_required = [
        'config.json',
        'diffusion_pytorch_model.bin'
    ]

    if '/' in path and path.count('/') == 1:
        if not os.path.isdir(path) and not os.path.isabs(path) and not os.path.isfile(path):
            return ModelType.HuggingFace

    if os.path.splitext(path)[1] == '.safetensors':
        return ModelType.Lora
    
    if not os.path.isdir(path):
        return None

    if checkDirs(diffusers_required, path):
        return ModelType.Model
    elif checkDirs(vae_required, path):
        return ModelType.Vae
    else:
        return None


def checkDirs(dirsList, path):
    return all(os.path.exists(os.path.join(path, diffuser)) for diffuser in dirsList)
