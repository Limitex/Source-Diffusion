import json
import os
from py_src.osPath import get_models_config_path

class DiffusersModel:
    def __init__(self, type: str, path: str, name: str, discription: str) -> None:
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
            data.append(DiffusersModel(
                type=json_data['type'],
                path=json_data['path'],
                name=json_data['name'],
                discription=json_data['discription']
            ))
        return data
    else:
        with open(configPath, "w") as f:
            f.write('[]')
        return []


