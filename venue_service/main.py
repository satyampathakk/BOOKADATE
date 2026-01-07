from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import venue

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Venue Service",
    description="Microservice for managing venues and availability",
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
app.include_router(venue.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "venue-service"}

@app.get("/")
def root():
    return {"message": "Venue Service API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
