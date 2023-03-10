from typing import List, Optional, Union
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
    model: Union[str, None]
    vae_model: Union[str, None]

class ModelChangeContainer(BaseModel):
    model_id: Union[str, None]
    vae_id: Union[str, None]

class ServerStatus(BaseModel):
    status: int
    status_str: str