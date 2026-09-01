from fastapi import APIRouter, Depends, HTTPException, Query
from app.services.geo_service import resolve_ward_from_gps, GeoResolutionResult
from app.api.deps import get_internal_service_key

router = APIRouter()

@router.get("/resolve-ward", response_model=GeoResolutionResult)
async def resolve_ward(
    latitude: float = Query(..., description="GPS Latitude"),
    longitude: float = Query(..., description="GPS Longitude"),
    api_key: str = Depends(get_internal_service_key)
):
    """
    Resolves a given GPS coordinate to a specific administrative Ward
    and Constituency using GeoPandas spatial joins.
    """
    result = resolve_ward_from_gps(latitude, longitude)
    if not result:
        raise HTTPException(status_code=404, detail="Coordinates out of bounds or ward not found.")
    return result
