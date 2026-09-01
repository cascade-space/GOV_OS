from fastapi import APIRouter, Depends
from app.models.classification import ClassificationRequest, ClassificationResult
from app.services.classify_service import classify_complaint_text
from app.api.deps import get_internal_service_key

router = APIRouter()

@router.post("/classify", response_model=ClassificationResult)
async def classify_complaint(
    request: ClassificationRequest,
    api_key: str = Depends(get_internal_service_key)
):
    """
    Analyzes a civic complaint's title and description using GenAI 
    to determine its category and priority.
    Only accessible internally by Spring Boot backend.
    """
    result = classify_complaint_text(request)
    return result
