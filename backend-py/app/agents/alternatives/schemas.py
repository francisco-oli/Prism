from pydantic import BaseModel

class AlternativesRequest(BaseModel):
    barcode: str
    user_id: str


class Alternative(BaseModel):
    barcode: str
    name: str
    reason: str          

class AlternativesResponse(BaseModel):
    alternatives: list[Alternative]   