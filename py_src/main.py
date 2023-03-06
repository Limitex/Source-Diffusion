import io
import os
import torch
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from py_src.apiModel import *
from py_src.diffuserRapper import diffusionGenerate, load
from py_src.osPath import get_user_data

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

modelsPath = os.path.join(get_user_data(), 'models')

@app.post('/')
async def ready():
    return ServerStatus(status=0, status_str='server is ready')

@app.post("/generate")
async def generate(gc: GenerateContainer):
    images = diffusionGenerate(gc)
    print(gc)
    images_encoded = []
    for x in range(len(images)):
        print(images[x])
        output = io.BytesIO()
        images[x].save(output, format='PNG')
        byte_image = output.getvalue()
        encoded_data = base64.b64encode(byte_image).decode('ascii')
        images_encoded.append(encoded_data)
    return GenerationOutput(output=images_encoded)

@app.post('/getmodelslist')
async def getModelsList():
    dirList = [d for d in os.listdir(modelsPath) if os.path.isdir(os.path.join(modelsPath, d))]
    vae_dirs = [d for d in dirList if '.vae' in d]
    model_dirs = [d for d in dirList if '.vae' not in d]
    return ModelListOutput(model_list=model_dirs, vae_model_list=vae_dirs)

@app.post('/switchModel')
async def switchModel(mcc: ModelChangeContainer):
    load(os.path.join(modelsPath, mcc.model_name), os.path.join(modelsPath, mcc.vae_model_name), torch.float16)
    return ServerStatus(status=0, status_str='server is ready')