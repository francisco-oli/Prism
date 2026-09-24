from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.prompts import build_user_prompt
from app.schemas import AnalyzeRequest
from app.services.cache import get_cached, set_cached
from app.services.fingerprint import generate_hash
from app.services.gemini import generate_analysis

router = APIRouter()


@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    try:
        key = generate_hash(request.data)

        cached = get_cached(key)
        if cached is not None:
            return {"success": True, "source": "cache_hit", "data": cached}

        analysis = generate_analysis(build_user_prompt(request.data))
        set_cached(key, analysis)
        return {"success": True, "source": "cache_miss_ai_call", "data": analysis}
    except Exception as e:
        print(f"API Error: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})
