import json
import os
import time
from PIL import Image, PngImagePlugin
import py_src.diffuserWrapper
from py_src.lib.apiModel import GenerateStreamInput

def save_image_with_metadata(image: Image.Image, save_path: str, metadata: dict):
    img_info = image.info
    img_info.update(metadata)
    info = PngImagePlugin.PngInfo()
    for k, v in img_info.items():
        info.add_itxt(k, str(v))
    image.save(save_path, pnginfo=info)

def generate_unique_filepath(base_path, extension):
    iteration = 0
    suffix = '.' + extension
    new_path = f'{base_path}{suffix}'
    while os.path.exists(new_path):
        iteration += 1
        new_path = f'{base_path}-{iteration}{suffix}'
    return new_path

def save_image_base(image: Image.Image, dir_path: str, metadata: dict):
    id = str(int(time.time() * 10 ** 6))
    save_path = os.path.join(dir_path, generate_unique_filepath(id, 'png'))

    os.makedirs(dir_path, exist_ok=True)
    save_image_with_metadata(image, save_path, metadata)

def saveimage(savepath, image, gc :GenerateStreamInput):
    os.makedirs(savepath, exist_ok=True)
    generateData = gc.dict()
    generateData.update({
        "model": py_src.diffuserWrapper.loadedModelId,
        "vae": py_src.diffuserWrapper.loadedVaeModelId,
        "lora": py_src.diffuserWrapper.loadedLoraModelId,
    })
    save_image_base(image, savepath, generateData)