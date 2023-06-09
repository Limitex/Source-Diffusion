from typing import Optional, List, Tuple, Union
from pydantic import BaseModel
from py_src.loadModelsConfig import ModelType


class ServerStatus(BaseModel):
    status: int
    status_str: str


class PostPid(BaseModel):
    pid: int


class GenerateStreamInput(BaseModel):
    positive: str
    negative: str
    height: int
    width: int
    steps: int
    scale: float
    num: int
    eta: float
    seed: int


class GenerateStreamOutput(BaseModel):
    type: str
    output: Optional[List[Tuple[int, str]]] = None
    json_output: Optional[str] = None


class ModelInfoOutput(BaseModel):
    models_json: str


class LoadedModelInfoOutput(BaseModel):
    model: Union[str, None]
    vae_model: Union[str, None]
    lora_model: Union[str, None]


class ModelChangeInput(BaseModel):
    mtype: Union[str, None]
    model_id: Union[str, None]
    vae_id: Union[str, None]
    lora_id: Union[str, None]


class AddNewModelInput(BaseModel):
    path: str
    name: str
    description: str


class UpdateModelInfoInput(BaseModel):
    path: str
    name: str
    description: str


class DeleteModelInput(BaseModel):
    path: str