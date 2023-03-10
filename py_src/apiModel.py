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
    model_id_list: List[str]
    model_name_list: List[str]
    vae_id_list: List[str]
    vae_name_list: List[str]

class ModelOutput(BaseModel):
    model: str
    vae_model: str

class ModelChangeContainer(BaseModel):
    model_name: str
    vae_model_name: str

class ServerStatus(BaseModel):
    status: int
    status_str: str