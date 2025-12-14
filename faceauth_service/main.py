from fastapi import FastAPI
from routers.faceauth import router as faceauth_router
from database import Base, engine

app = FastAPI(title="Face Authentication Service", version="1.0.0")

# Ensure tables exist on startup (replace with migrations in production)
Base.metadata.create_all(bind=engine)

app.include_router(faceauth_router, prefix="/faceauth")

@app.get("/health")
def health_check():
    return {"status": "faceauth service running"}
