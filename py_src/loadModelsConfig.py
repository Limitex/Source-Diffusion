import json
import os
import shutil
from py_src.osPath import get_models_config_path, get_models_path
from enum import Enum


class ModelType(Enum):
    Model = 'model'
    Vae = 'vae'
    HuggingFace = 'huggingface'
    Lora = 'lora'


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
            if json_data['type'] == 'model':
                modelType = ModelType.Model
            elif json_data['type'] == 'vae':
                modelType = ModelType.Vae
            elif json_data['type'] == 'huggingface':
                modelType = ModelType.HuggingFace
            elif json_data['type'] == 'lora':
                modelType = ModelType.Lora
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
        return False
    
    targetPath = os.path.join(get_models_path(), target[0]['path'])
    modelType = get_model_type(target[0]['type'])
    if modelType == ModelType.HuggingFace:
        pass
    elif modelType == ModelType.Model or modelType == ModelType.Vae:
        shutil.rmtree(targetPath)
    elif modelType == ModelType.Lora:
        os.remove(targetPath)

    deleted = [model for model in json_load if model['path'] != path]
    with open(get_models_config_path(), 'w') as f:
        json.dump(deleted, f)
    return True

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