from fastapi import FastAPI
from routers.faceauth import router as faceauth_router

app = FastAPI(title="Face Authentication Service", version="1.0.0")

app.include_router(faceauth_router, prefix="/faceauth")

@app.get("/health")
def health_check():
    return {"status": "faceauth service running"}
