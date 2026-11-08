from pydantic import BaseModel
from app.schemas import ScannedData

class AlternativesRequest(BaseModel):
    data: ScannedData


class Alternative(BaseModel):
    barcode: str
    name: str
    reason: str          

class AlternativesResponse(BaseModel):
    alternatives: list[Alternative]   