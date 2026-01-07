from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import matching

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Matching Service",
    description="Microservice for matching blind date users",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(matching.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "matching-service"}

@app.get("/")
def root():
    return {"message": "Matching Service API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
