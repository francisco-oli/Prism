from fastapi import FastAPI

from app.routes.analyze import router as analyze_router

app = FastAPI(title="Prism API")

app.include_router(analyze_router, prefix="/api")


@app.get("/")
@app.get("/health")
def health():
    return {"status": "ok"}
