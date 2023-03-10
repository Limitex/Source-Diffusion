import asyncio
import io
import json
import os
import traceback
import torch
import base64
import py_src.diffuserRapper
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
from py_src.apiModel import *
from py_src.diffuserRapper import diffusionGenerate_async, load
from py_src.osPath import get_models_path
from py_src.loadModelsConfig import ModelType, idToName, loadConfig

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

@app.post('/')
async def ready():
    return ServerStatus(status=0, status_str='server is ready')

@app.websocket("/generate")
async def generate(websocket: WebSocket):
    def progress(step: int, timestep: int, latents: torch.FloatTensor):
        out = {
            "steps":int(step),
            "max_steps":int(gc.steps),
            "timetep":int(timestep)
        }
        data = GenerationOutput(type="progress", json_output=json.dumps(out)).json()
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
            }
        )
    return ModelListOutput(models_json=json.dumps(sendData))

@app.post('/getloadedmodel')
async def getloadedmodel():
    modelName = idToName(config, py_src.diffuserRapper.loadedModelId)
    vaeName = idToName(config, py_src.diffuserRapper.loadedVaeModelId)
    return ModelOutput(model=modelName, vae_model=vaeName)

@app.post('/switchModel')
async def switchModel(mcc: ModelChangeContainer):
    try:
        load(mcc.model_id, torch.float16, mcc.vae_id)
        return ServerStatus(status=0, status_str='server is ready')
    except :
        return ServerStatus(status=1, status_str=traceback.format_exc())

@app.post('/loadnewmodel')
async def loadNewModel(lnmi: LoadNewModelInfo):
    print(lnmi)
    return ServerStatus(status=0, status_str='server is ready')