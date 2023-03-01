import io
import torch
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from py_src.apiModel import GenerateContainer, GenerationOutput
from py_src.diffuserRapper import generate, load

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

load('models/AbyssOrangeMix2_nsfw', 'models/AbyssOrangeMix2_nsfw.vae', torch.float16)

@app.post("/")
async def root(gc: GenerateContainer):
    images = generate(gc)
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