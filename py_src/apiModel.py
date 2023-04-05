from typing import List, Optional, Union
from pydantic import BaseModel
from py_src.loadModelsConfig import ModelType


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
    lora_model: Union[str, None]


class ModelChangeContainer(BaseModel):
    mtype: Union[str, None]
    model_id: Union[str, None]
    vae_id: Union[str, None]
    lora_id: Union[str, None]


class ServerStatus(BaseModel):
    status: int
    status_str: str


class LoadNewModelInfo(BaseModel):
    path: str
    name: str
    description: str


class ChangeModelInput(BaseModel):
    path: str
    name: str
    description: str


class PostPid(BaseModel):
    pid: int