from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.agents.alternatives.schemas import AlternativesResponse, AlternativesRequest
from app.agents.alternatives.graph import run_alternatives_agent


router = APIRouter()


@router.post("/alternatives", response_model=AlternativesResponse)
async def alternatives(req: AlternativesRequest):
    # check cache first (keyed by product barcode)
    
    return await run_alternatives_agent(req)
  