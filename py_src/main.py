import asyncio
import io
import json
import os
import shutil
import sys
import time
import traceback
import torch
import base64
import psutil
from . import diffusionai
from .diffusionai import ModelType
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
from py_src.lib.apiModel import *
from py_src.lib.save import saveimage
from py_src.loadUserConfig import loadUserConfig, saveUserConfig
from py_src.osPath import get_models_path
from py_src.loadModelsConfig import addNewModelToConfig, deleteModelConfig, get_model_type, idToName, loadConfig, updateModelConfig

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor()

try:
    config = loadConfig()
except:
    raise FileNotFoundError('It could not be read because the structure of the models.json file is different.'
                            'Please correct the contents of the file or delete it and try again.')
try:
    user_config = loadUserConfig()
except:
    raise FileNotFoundError('It could not be read because the structure of the user_config.json file is different.'
                            'Please correct the contents of the file or delete it and try again.')

Generator = diffusionai.DiffusionTool(cache=get_models_path())

ClientRunningFlag = False
PidHeartbeatFlug = False

def serverExit():
    os.kill(os.getpid(), 15) # SIGTERM 
    # os.kill(os.getpid(), 9)  # SIGKILL

@app.on_event("startup")
async def on_startup():
    def clientRunnigCheckRoop():
        time.sleep(2.0)
        if not ClientRunningFlag:
            serverExit() 
    executor.submit(clientRunnigCheckRoop)

@app.post('/')
async def ready():
    global ClientRunningFlag
    ClientRunningFlag = True
    return ServerStatus(status=0, status_str='server is ready')


@app.post('/postpid')
async def postpid(pd: PostPid):
    global PidHeartbeatFlug
    def checkParentRoop(pid):
        while True:
            process_exists = psutil.pid_exists(pid)
            if not process_exists:
                serverExit()
            time.sleep(2.0)
    
    if not PidHeartbeatFlug:
        PidHeartbeatFlug = True
        executor.submit(checkParentRoop, pd.pid)


@app.post('/usersettings')
async def usersettings(usersettings: UserSettingsInput):
    global user_config
    if not os.path.isabs(usersettings.savepath):
        return ServerStatus(status=1, status_str='Please enter full path')
    user_config = usersettings.__dict__
    saveUserConfig(usersettings.__dict__)
    return ServerStatus(status=0, status_str='Save completed.')

@app.post('/getusersettings')
async def getusersettings():
    global user_config
    return user_config

@app.websocket("/generate")
async def generate(websocket: WebSocket):
    global user_config

    def progress(step: int, timestep: int, latents: torch.FloatTensor):
        out = {
            "steps": int(step),
            "max_steps": int(param.steps),
            "timetep": int(timestep)
        }
        data = GenerateStreamOutput(
            type="progress", json_output=json.dumps(out)).model_dump_json()
        executor.submit(asyncio.run, websocket.send_bytes(data))

    await websocket.accept()
    Generator.set_generate_callback(progress)
    param = diffusionai.DiffusionImageParameters(**json.loads(await websocket.receive_text()))
    print(param)
    images, returnd_param = await Generator.generate(param)
    images_encoded = []
    for x in range(len(images)):
        print(images[x])
        output = io.BytesIO()
        images[x][0].save(output, format='PNG')
        byte_image = output.getvalue()
        encoded_data = base64.b64encode(byte_image).decode('ascii')
        images_encoded.append((images[x][1], encoded_data))
        returnd_param.seed = images[x][1]
        if user_config["save_enabled"]:
            saveimage(user_config["savepath"], images[x][0], returnd_param, Generator)
    returnd_param.seed = -1
    data = GenerateStreamOutput(type="generate", output=images_encoded, json_output=json.dumps(returnd_param.dict())).json()
    await websocket.send_bytes(data)
    await websocket.close()


@app.post('/getmodelslist')
async def getModelsList():
    sendData = []
    for data in config:
        sendData.append(
            {
                "type": data.type.value,
                "id": data.path,
                "name": data.name,
                "description": data.description
            }
        )
    return ModelInfoOutput(models_json=json.dumps(sendData))


@app.post('/getloadedmodel')
async def getloadedmodel():
    modelName = idToName(config, Generator.get_model_path())
    vaeName = idToName(config, Generator.get_vae_path())
    loraName = idToName(config, Generator.get_lora_path())
    return LoadedModelInfoOutput(model=modelName, vae_model=vaeName, lora_model=loraName)


@app.post('/switchModel')
async def switchModel(mcc: ModelChangeInput):
    global Generator
    try:
        if mcc.model_id:
            Generator.set_model(mcc.model_id)
        if mcc.vae_id:
            Generator.set_vae(mcc.vae_id)
        if mcc.lora_id:
            Generator.set_lora(mcc.lora_id)
        Generator.set_scheduler(diffusionai.Scheduler.EulerAncestralDiscrete)
        Generator.set_ready()
        return ServerStatus(status=0, status_str='server is ready')
    except:
        return ServerStatus(status=2, status_str=traceback.format_exc())


@app.post('/loadnewmodel')
async def loadNewModel(lnmi: AddNewModelInput):
    global config

    m = diffusionai.AutoModelLoader(cache=get_models_path())
    try:
        m.set_model(lnmi.path)
        importPath = m.get_path()
        importType = m.get_type()
        importName = lnmi.name
        importDisc = lnmi.description
    except:
        return ServerStatus(status=1, status_str=traceback.format_exc())
    
    addNewModelToConfig(
        importType,
        importPath,
        importName,
        importDisc)
    config = loadConfig()
    return ServerStatus(status=0, status_str='Successfully loaded!')


@app.post('/updatemodelinfo')
async def updateModelInfo(cmi: UpdateModelInfoInput):
    global config
    if updateModelConfig(cmi.path, cmi.name, cmi.description):
        config = loadConfig()
        return ServerStatus(status=0, status_str='Successfully updated!')
    else:
        return ServerStatus(status=1, status_str='The inputs name is the same.')


@app.post('/deletemodelinfo')
async def deleteModelInfo(dmi: DeleteModelInput):
    global config
    try:
        deleteModelConfig(dmi.path)
    except:
        ServerStatus(status=0, status_str=traceback.format_exc())
    finally:
        config = loadConfig()
