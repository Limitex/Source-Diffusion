import json
import os
from py_src.osPath import get_models_config_path
from enum import Enum

class ModelType(Enum):
    Model = 'model'
    Vae = 'vae'

class DiffusersModel:
    def __init__(self, type: ModelType, path: str, name: str, discription: str) -> None:
        self.type = type
        self.path = path
        self.name = name
        self.discription = discription

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
            else:
                raise ValueError('An unsupported model type was found.'
                                 'Please correct the contents of the file or delete it and try again.')
            
            data.append(DiffusersModel(
                type=modelType,
                path=json_data['path'],
                name=json_data['name'],
                discription=json_data['discription']
            ))
        return data
    else:
        with open(configPath, "w") as f:
            f.write('[]')
        return []

def idToName(config, id):
    return next((c.name for c in config if c.path == id), None)