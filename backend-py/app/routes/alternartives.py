from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.agents.alternatives.schemas import AlternativesResponse, AlternativesRequest
from app.agents.alternatives.graph import run_alternatives_agent


agent_router = APIRouter()

@agent_router.post("/alternatives", response_model=AlternativesResponse)
async def alternatives(req: AlternativesRequest):
    # check cache first (keyed by product barcode)

    print("Food Category: ", req.data.category)
    print("\nFood Subcategory: ", req.data.subcategory)
    
    return await run_alternatives_agent(req)
  