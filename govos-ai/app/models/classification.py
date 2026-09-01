from typing import Optional
from uuid import UUID
from app.models.base import GovOSBaseModel

class ClassificationRequest(GovOSBaseModel):
    title: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ClassificationResult(GovOSBaseModel):
    category: str
    priority: str
    suggestedWard: Optional[UUID] = None
    confidence: float
