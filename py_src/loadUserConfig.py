
import json
import os
from py_src.osPath import get_user_data_path, get_user_data

defaultData = {
    "savepath" : os.path.join(get_user_data(), 'images')
}

def loadUserConfig():
    configPath = get_user_data_path()
    if os.path.exists(configPath):
        json_open = open(configPath, 'r')
        return json.load(json_open)
    else:
        with open(configPath, "w") as f:
            f.write(json.dumps(defaultData))
        return defaultData
    
def saveUserConfig(config):
    configPath = get_user_data_path()
    with open(configPath, "w") as f:
        f.write(json.dumps(config))
    