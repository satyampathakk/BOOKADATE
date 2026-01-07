from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, photos, preferences, auth, admin
from database import Base, engine

# IMPORTANT: Import models before create_all
from models import user as user_models  

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service (Modular)")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(photos.router, prefix="/users", tags=["Photos"])
app.include_router(preferences.router, prefix="/users", tags=["Preferences"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
