import json
import os
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
