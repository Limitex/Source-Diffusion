from typing import List, Optional
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
    type: str
    output: Optional[List[str]] = None
    json_output: Optional[str] = None

class ModelListOutput(BaseModel):
    models_json: str

class ModelOutput(BaseModel):
    model: str
    vae_model: str

class ModelChangeContainer(BaseModel):
    model_id: str
    vae_id: str

class ServerStatus(BaseModel):
    status: int
    status_str: str