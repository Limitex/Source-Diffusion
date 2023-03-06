from typing import List
from pydantic import BaseModel

class GenerateContainer(BaseModel):
    positive: str
    negative: str
    height: int
    width: int
    steps: int
    scale: float
    num: int
    eta: float
    seed: int

class GenerationOutput(BaseModel):
    output: List[str]

class ModelListOutput(BaseModel):
    model_list: List[str]
    vae_model_list: List[str]

class ModelChangeContainer(BaseModel):
    model_name: str
    vae_model_name: str

class ServerStatus(BaseModel):
    status: int
    status_str: str