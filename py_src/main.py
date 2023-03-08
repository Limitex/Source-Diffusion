import asyncio
import io
import json
import os
import torch
import base64
import py_src.diffuserRapper
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from concurrent.futures import ThreadPoolExecutor
from py_src.apiModel import *
from py_src.diffuserRapper import diffusionGenerate_async, load
from py_src.osPath import get_user_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

executor = ThreadPoolExecutor()

global modelName, vaeName
modelName, vaeName = '', ''

modelsPath = os.path.join(get_user_data(), 'models')

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
    dirList = [d for d in os.listdir(modelsPath) if os.path.isdir(os.path.join(modelsPath, d))]
    vae_dirs = [d for d in dirList if '.vae' in d]
    model_dirs = [d for d in dirList if '.vae' not in d]
    return ModelListOutput(model_list=model_dirs, vae_model_list=vae_dirs)

@app.post('/getloadedmodel')
async def getloadedmodel():
    global modelName, vaeName
    return ModelOutput(model=modelName, vae_model=vaeName)

@app.post('/switchModel')
async def switchModel(mcc: ModelChangeContainer):
    global modelName, vaeName
    load(modelsPath, mcc.model_name, mcc.vae_model_name, torch.float16)
    modelName, vaeName = mcc.model_name, mcc.vae_model_name
    return ServerStatus(status=0, status_str='server is ready')