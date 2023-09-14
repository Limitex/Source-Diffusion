import json
import os
import shutil
from .diffusionai import ModelType
from py_src.osPath import get_cache_path, get_models_config_path, get_models_path
from enum import Enum

class DiffusersModel:
    def __init__(self, type: ModelType, path: str, name: str, description: str) -> None:
        self.type = type
        self.path = path
        self.name = name
        self.description = description


def get_model_type(string):
    for model_type in ModelType:
        if string == model_type.value:
            return model_type
    raise ValueError("Invalid model type")


def loadConfig():
    configPath = get_models_config_path()
    if os.path.exists(configPath):
        json_open = open(get_models_config_path(), 'r')
        json_load = json.load(json_open)
        data = []
        for json_data in json_load:
            if json_data['type'] == ModelType.SD_model.value:
                modelType = ModelType.SD_model
            elif json_data['type'] == ModelType.VAE_model.value:
                modelType = ModelType.VAE_model
            elif json_data['type'] == ModelType.LORA_model.value:
                modelType = ModelType.LORA_model
            else:
                raise ValueError('An unsupported model type was found.'
                                 'Please correct the contents of the file or delete it and try again.')

            data.append(DiffusersModel(
                type=modelType,
                path=json_data['path'],
                name=json_data['name'],
                description=json_data['description']
            ))
        return data
    else:
        if not os.path.isdir(get_models_path()):
            os.mkdir(get_models_path())
        with open(configPath, "w") as f:
            f.write('[]')
        return []


def idToName(config, id):
    return next((c.name for c in config if c.path == id), None)


def addNewModelToConfig(type: ModelType, path: str, name: str, description: str):
    json_open = open(get_models_config_path(), 'r')
    json_load = json.load(json_open)
    new_data = {
        "type": type.value,
        "path": path,
        "name": name,
        "description": description
    }
    if any(d['path'] == new_data['path'] for d in json_load):
        print('Data with path {} already exists. Skipping addition.'.format(
            new_data['path']))
    else:
        json_load.append(new_data)
        with open(get_models_config_path(), 'w') as f:
            json.dump(json_load, f)

def deleteModelConfig(path: str):
    json_open = open(get_models_config_path(), 'r')
    json_load = json.load(json_open)
    target =  [model for model in json_load if model['path'] == path]
    if len(target) == 0:
        return 1
    
    deleted = [model for model in json_load if model['path'] != path]
    with open(get_models_config_path(), 'w') as f:
        json.dump(deleted, f)
    
    targetPath = os.path.join(get_models_path(), target[0]['path'])
    modelType = get_model_type(target[0]['type'])
    try:
        # TODO : Add code to delete cache
        # if modelType == ModelType.HuggingFace:
        #     cache_path = get_cache_path()
        #     dirs = [d for d in os.listdir(cache_path) if os.path.isdir(os.path.join(cache_path, d))]
        #     names = target[0]['path'].split('/')
        #     targetNames = [d for d in dirs if names[0] in d and names[1] in d]
        #     targetPath = os.path.join(cache_path, targetNames[0])
        #     shutil.rmtree(targetPath)
        # elif modelType == ModelType.Model or modelType == ModelType.Vae:
        #     shutil.rmtree(targetPath)
        # elif modelType == ModelType.Lora:
        #     os.remove(targetPath)
        pass
    except:
        raise
    return 0

def updateModelConfig(path: str, name: str, description: str):
    json_open = open(get_models_config_path(), 'r')
    json_load = json.load(json_open)
    if len([model for model in json_load if model['path'] == path]) == 0:
        return False
    for item in json_load:
        if item['path'] == path:
            item['name'] = name
            item['description'] = description
            break
    with open(get_models_config_path(), 'w') as f:
        json.dump(json_load, f)
    return True