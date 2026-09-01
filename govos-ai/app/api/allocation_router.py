from fastapi import APIRouter, Depends, HTTPException
from app.models.allocation import AllocationRequest, AllocationResult
from app.services.allocation_service import allocate_officer
from app.api.deps import get_internal_service_key

router = APIRouter()

@router.post("/assign", response_model=AllocationResult)
async def assign_complaint(
    request: AllocationRequest,
    api_key: str = Depends(get_internal_service_key)
):
    """
    Analyzes a complaint context and a list of available officers,
    then uses GenAI reasoning to determine the optimal assignee.
    """
    try:
        result = allocate_officer(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
