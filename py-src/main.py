from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
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

@app.post("/")
async def root(gc: GenerateContainer):
    print(gc)
    return {"message": "Hello World"}