from fastapi import Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from app.config import settings
import jwt

# Inter-service authentication
api_key_header = APIKeyHeader(name="X-Service-Key", auto_error=False)

async def get_internal_service_key(api_key_header: str = Security(api_key_header)):
    if not api_key_header or api_key_header != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=403, detail="Could not validate credentials for internal service"
        )
    return api_key_header
