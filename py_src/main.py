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
import py_src.diffuserRapper
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
from py_src.apiModel import *
from py_src.diffuserRapper import TestLoad, diffusionGenerate_async, load
from py_src.dirsChecker import determine_model_type
from py_src.osPath import get_models_path
from py_src.loadModelsConfig import ModelType, addNewModelToConfig, get_model_type, idToName, loadConfig

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


@app.websocket("/generate")
async def generate(websocket: WebSocket):
    def progress(step: int, timestep: int, latents: torch.FloatTensor):
        out = {
            "steps": int(step),
            "max_steps": int(gc.steps),
            "timetep": int(timestep)
        }
        data = GenerationOutput(
            type="progress", json_output=json.dumps(out)).json()
        executor.submit(asyncio.run, websocket.send_bytes(data))

    await websocket.accept()
    gc = GenerateContainer.parse_raw(await websocket.receive_text())
    py_src.diffuserRapper.generate_progress_callback = progress
    images = await diffusionGenerate_async(gc)
    print(gc)
    images_encoded = []
    for x in range(len(images)):
        print(images[x])
        output = io.BytesIO()
        images[x].save(output, format='PNG')
        byte_image = output.getvalue()
        encoded_data = base64.b64encode(byte_image).decode('ascii')
        images_encoded.append(encoded_data)
    data = GenerationOutput(type="generate", output=images_encoded).json()
    await websocket.send_bytes(data)


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
    return ModelListOutput(models_json=json.dumps(sendData))


@app.post('/getloadedmodel')
async def getloadedmodel():
    modelName = idToName(config, py_src.diffuserRapper.loadedModelId)
    vaeName = idToName(config, py_src.diffuserRapper.loadedVaeModelId)
    loraName = idToName(config, py_src.diffuserRapper.loadedLoraModelId)
    return ModelOutput(model=modelName, vae_model=vaeName, lora_model=loraName)


@app.post('/switchModel')
async def switchModel(mcc: ModelChangeContainer):
    try:
        load(get_model_type(mcc.mtype), mcc.model_id, torch.float16, mcc.vae_id, mcc.lora_id)
        return ServerStatus(status=0, status_str='server is ready')
    except:
        return ServerStatus(status=2, status_str=traceback.format_exc())


@app.post('/loadnewmodel')
async def loadNewModel(lnmi: LoadNewModelInfo):
    global config

    importType = determine_model_type(lnmi.path)

    if importType == ModelType.Model or importType == ModelType.Vae or importType == ModelType.Lora:
        importPath = os.path.basename(lnmi.path)
    elif importType == ModelType.HuggingFace:
        importPath = lnmi.path
    else:
        return ServerStatus(status=1, status_str='The model type could not be determined from the input model path.')
    
    importName = lnmi.name
    importDisc = lnmi.description

    if any(data.path == importPath or data.name == importName for data in config):
        return ServerStatus(status=1, status_str='The specified directory name or name has already been added.')
    
    if not TestLoad(lnmi.path, importType):
        return ServerStatus(status=1, status_str='The specified directory is not a \"Diffusers model\" or \"Vae\".')
    
    if importType == ModelType.Model or importType == ModelType.Vae:
        try:
            shutil.copytree(lnmi.path, os.path.join(get_models_path(), importPath))
        except FileNotFoundError:
            return ServerStatus(status=1, status_str='Directory was not found.')
        except FileExistsError:
            return ServerStatus(status=1, status_str='That directory exists.')
        except Exception as e:
            return ServerStatus(status=1, status_str='Othe Error.\n' + e)
    
    if importType == ModelType.Lora:
        shutil.copyfile(lnmi.path,  os.path.join(get_models_path(), importPath))
    
    addNewModelToConfig(
        importType,
        importPath,
        importName,
        importDisc)
    config = loadConfig()
    return ServerStatus(status=0, status_str='Successfully loaded!')


@app.post('/updatemodelinfo')
async def updateModelInfo(cmi: ChangeModelInput):
    print(cmi)
    return ServerStatus(status=0, status_str='Successfully updated!')
