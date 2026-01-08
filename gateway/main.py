from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
import httpx
import logging
from typing import Optional

# --------------------------------------------------
# Logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api-gateway")

# --------------------------------------------------
# App
# --------------------------------------------------
app = FastAPI(title="API Gateway", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Services
# --------------------------------------------------
SERVICE_URLS = {
    "user": "http://localhost:8006",
    "match": "http://localhost:8002",
    "booking": "http://localhost:8003",
    "venue": "http://localhost:8004",
    "chat": "http://localhost:8001",
}

# --------------------------------------------------
# Public routes (NO AUTH)
# --------------------------------------------------
PUBLIC_PREFIXES = (
    "/auth/login",
    "/auth/signup",
    "/health",
    "/docs",
    "/openapi.json",
    "/chat/match",
    "/chat/sessions",
)

# --------------------------------------------------
# HTTP Client
# --------------------------------------------------
client = httpx.AsyncClient(
    timeout=httpx.Timeout(30.0, connect=10.0)
)

# --------------------------------------------------
# Helpers
# --------------------------------------------------
def is_public(path: str, method: str = "GET") -> bool:
    # Check basic public prefixes
    if any(path.startswith(p) for p in PUBLIC_PREFIXES):
        return True
    
    # Allow GET requests to venues for browsing (but not POST/PUT/DELETE)
    if path.startswith("/venues") and method == "GET":
        return True
    
    return False


async def verify_token(token: str) -> dict:
    try:
        res = await client.post(
            f"{SERVICE_URLS['user']}/auth/verify-token",
            headers={"Authorization": f"Bearer {token}"}
        )

        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")

        return res.json()

    except httpx.RequestError as e:
        logger.error(f"Auth service down: {e}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")


async def proxy_request(
    service_url: str,
    request: Request,
    path_override: Optional[str] = None
):
    try:
        url = f"{service_url}{path_override or request.url.path}"

        headers = {
            k: v for k, v in request.headers.items()
            if k.lower() not in {"host", "content-length"}
        }

        body = await request.body()

        resp = await client.request(
            request.method,
            url,
            headers=headers,
            params=request.query_params,
            content=body if body else None
        )

        # ---- SAFE JSON HANDLING ----
        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                content = resp.json()
            except Exception:
                content = {"detail": resp.text}
            return JSONResponse(content, status_code=resp.status_code)

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=content_type
        )

    except httpx.RequestError as e:
        logger.error(f"Upstream error: {e}")
        raise HTTPException(status_code=503, detail="Service unavailable")


# --------------------------------------------------
# Middleware (AUTH)
# --------------------------------------------------
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method

    # Skip auth for OPTIONS, public routes, and admin routes
    if method == "OPTIONS" or is_public(path, method) or path.startswith("/admin"):
        return await call_next(request)

    auth = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return JSONResponse(
            {"detail": "Authorization required"},
            status_code=401
        )

    token = auth.split(" ", 1)[1]

    try:
        request.state.user = await verify_token(token)
    except HTTPException as e:
        return JSONResponse({"detail": e.detail}, status_code=e.status_code)

    return await call_next(request)


# --------------------------------------------------
# Health
# --------------------------------------------------
@app.get("/health")
async def health():
    return {"gateway": "healthy"}


# --------------------------------------------------
# ROUTES
# --------------------------------------------------
@app.api_route("/auth/{path:path}", methods=["GET", "POST"])
async def auth_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["user"],
        request,
        f"/auth/{path}"
    )


@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def user_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["user"],
        request,
        f"/users/{path}"
    )


@app.api_route("/admin/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def admin_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["user"],
        request,
        f"/admin/{path}"
    )


@app.api_route("/matches/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def match_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["match"],
        request,
        f"/matches/{path}"
    )


@app.api_route("/bookings/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def booking_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["booking"],
        request,
        f"/bookings/{path}"
    )


@app.api_route("/venues/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def venue_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["venue"],
        request,
        f"/venues/{path}"
    )


@app.api_route("/chat/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def chat_routes(path: str, request: Request):
    return await proxy_request(
        SERVICE_URLS["chat"],
        request,
        f"/{path}"
    )


# --------------------------------------------------
# Shutdown
# --------------------------------------------------
@app.on_event("shutdown")
async def shutdown():
    await client.aclose()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
