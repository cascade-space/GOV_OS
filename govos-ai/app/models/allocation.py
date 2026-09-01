from typing import List, Optional
from uuid import UUID
from app.models.base import GovOSBaseModel

class OfficerContext(GovOSBaseModel):
    officer_id: UUID
    name: str
    department: str
    current_workload: int
    ward_id: Optional[UUID] = None

class AllocationRequest(GovOSBaseModel):
    complaint_id: UUID
    category: str
    priority: str
    ward_id: Optional[UUID] = None
    available_officers: List[OfficerContext]

class AllocationResult(GovOSBaseModel):
    officerId: UUID
    reasoning: str
