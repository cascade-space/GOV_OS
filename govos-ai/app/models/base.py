from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class GovOSBaseModel(BaseModel):
    """Base Pydantic model for GovOS AI microservice"""
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True
    )
