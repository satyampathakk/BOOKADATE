from fastapi import FastAPI, Request, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Service URLs - Configure these based on your setup
SERVICE_URLS = {
    "user_service": "http://localhost:8000",
    # Add other microservices here
    # "match_service": "http://localhost:8001",
    # "chat_service": "http://localhost:8002",
}

# Routes that don't require authentication
PUBLIC_ROUTES = [
    "/auth/signup",
    "/auth/login",
    "/health",
    "/docs",
    "/openapi.json",
]

# HTTP Client with timeout
timeout = httpx.Timeout(30.0, connect=10.0)
client = httpx.AsyncClient(timeout=timeout)

async def verify_token(token: str) -> dict:
    """
    Verify token with user service
    Returns user info if valid, raises HTTPException if invalid
    """
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post(
            f"{SERVICE_URLS['user_service']}/auth/verify-token",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
    except httpx.RequestError as e:
        logger.error(f"Error verifying token: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable"
        )

def is_public_route(path: str) -> bool:
    """Check if route is public (doesn't require authentication)"""
    for public_path in PUBLIC_ROUTES:
        if path.startswith(public_path):
            return True
    return False

@app.middleware("http")
async def gateway_middleware(request: Request, call_next):
    """
    Gateway middleware that:
    1. Checks if route is public
    2. Verifies JWT token for protected routes
    3. Forwards request to appropriate microservice
    """
    path = request.url.path
    
    # Allow public routes without authentication
    if is_public_route(path):
        return await call_next(request)
    
    # Check for Authorization header
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Missing or invalid authorization header"}
        )
    
    # Extract token
    token = auth_header.split(" ")[1]
    
    # Verify token with user service
    try:
        user_info = await verify_token(token)
        # Add user info to request state for downstream use
        request.state.user = user_info
        logger.info(f"Authenticated user: {user_info.get('user_id')}")
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )
    
    return await call_next(request)

async def forward_request(
    service_url: str,
    path: str,
    method: str,
    headers: dict,
    body: Optional[bytes] = None,
    params: dict = None
):
    """Forward request to microservice"""
    try:
        url = f"{service_url}{path}"
        
        # Remove host header to avoid conflicts
        headers_to_forward = {k: v for k, v in headers.items() if k.lower() != "host"}
        
        response = await client.request(
            method=method,
            url=url,
            headers=headers_to_forward,
            content=body,
            params=params
        )
        
        return JSONResponse(
            content=response.json() if response.text else {},
            status_code=response.status_code,
            headers=dict(response.headers)
        )
    except httpx.RequestError as e:
        logger.error(f"Error forwarding request to {service_url}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service temporarily unavailable"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

@app.get("/health")
async def health_check():
    """Gateway health check"""
    service_health = {}
    
    for service_name, service_url in SERVICE_URLS.items():
        try:
            response = await client.get(f"{service_url}/health", timeout=5.0)
            service_health[service_name] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "status_code": response.status_code
            }
        except Exception as e:
            service_health[service_name] = {
                "status": "unavailable",
                "error": str(e)
            }
    
    return {
        "gateway": "healthy",
        "services": service_health
    }

# ==================== USER SERVICE ROUTES ====================

@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_routes(path: str, request: Request):
    """Forward authentication requests to user service"""
    body = await request.body() if request.method in ["POST", "PUT"] else None
    
    return await forward_request(
        service_url=SERVICE_URLS["user_service"],
        path=f"/auth/{path}",
        method=request.method,
        headers=dict(request.headers),
        body=body,
        params=dict(request.query_params)
    )

@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def user_routes(path: str, request: Request):
    """Forward user requests to user service (requires authentication)"""
    body = await request.body() if request.method in ["POST", "PUT"] else None
    
    return await forward_request(
        service_url=SERVICE_URLS["user_service"],
        path=f"/users/{path}",
        method=request.method,
        headers=dict(request.headers),
        body=body,
        params=dict(request.query_params)
    )

# ==================== EXAMPLE: OTHER SERVICE ROUTES ====================
# Uncomment and modify these when you add more microservices

# @app.api_route("/matches/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
# async def match_routes(path: str, request: Request):
#     """Forward match requests to match service (requires authentication)"""
#     body = await request.body() if request.method in ["POST", "PUT"] else None
#     
#     return await forward_request(
#         service_url=SERVICE_URLS["match_service"],
#         path=f"/matches/{path}",
#         method=request.method,
#         headers=dict(request.headers),
#         body=body,
#         params=dict(request.query_params)
#     )

# @app.api_route("/chats/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
# async def chat_routes(path: str, request: Request):
#     """Forward chat requests to chat service (requires authentication)"""
#     body = await request.body() if request.method in ["POST", "PUT"] else None
#     
#     return await forward_request(
#         service_url=SERVICE_URLS["chat_service"],
#         path=f"/chats/{path}",
#         method=request.method,
#         headers=dict(request.headers),
#         body=body,
#         params=dict(request.query_params)
#     )

@app.on_event("shutdown")
async def shutdown_event():
    """Close HTTP client on shutdown"""
    await client.aclose()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)