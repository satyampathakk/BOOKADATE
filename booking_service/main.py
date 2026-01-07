from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers import booking

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Booking Service",
    description="Microservice for booking blind dates",
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
app.include_router(booking.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "booking-service"}

@app.get("/")
def root():
    return {"message": "Booking Service API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
