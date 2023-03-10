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
from py_src.loadModelsConfig import ModelType, loadConfig

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
    data = GenerationOutput(type="generate" ,output=images_encoded).json()
    await websocket.send_bytes(data)

@app.post('/getmodelslist')
async def getModelsList():
    models = []
    vaes = []
    modelNames = []
    vaeNames = []
    for data in config:
        if data.type == ModelType.Model:
            models.append(data.path)
            modelNames.append(data.name)
        elif data.type == ModelType.Vae:
            vaes.append(data.path)
            vaeNames.append(data.name)
    return ModelListOutput(
        model_id_list=models,
        model_name_list=modelNames,
        vae_id_list=vaes,
        vae_name_list=vaeNames,
    )

@app.post('/getloadedmodel')
async def getloadedmodel():
    return ModelOutput(model=py_src.diffuserRapper.loadedModelName, vae_model=py_src.diffuserRapper.loadedVaeModelName)

@app.post('/switchModel')
async def switchModel(mcc: ModelChangeContainer):
    try:
        load(get_models_path(), mcc.model_id, mcc.vae_id, torch.float16)
        return ServerStatus(status=0, status_str='server is ready')
    except :
        return ServerStatus(status=1, status_str=traceback.format_exc())