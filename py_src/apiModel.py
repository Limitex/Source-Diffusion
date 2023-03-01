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