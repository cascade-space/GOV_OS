from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.classify_router import router as classify_router
from app.api.allocation_router import router as allocation_router
from app.api.geo_router import router as geo_router

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "govos-ai"}

app.include_router(classify_router, prefix=f"{settings.API_V1_STR}/ai", tags=["classification"])
app.include_router(allocation_router, prefix=f"{settings.API_V1_STR}/allocation", tags=["allocation"])
app.include_router(geo_router, prefix=f"{settings.API_V1_STR}/geo", tags=["geospatial"])
