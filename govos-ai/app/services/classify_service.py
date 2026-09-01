import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from app.models.classification import ClassificationResult, ClassificationRequest
from app.config import settings

# Initialize GenAI Client using standard google-genai SDK
client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Define the expected JSON output schema
class GeminiClassificationOutput(BaseModel):
    category: str = Field(description="The category of the complaint, e.g. INFRASTRUCTURE, SANITATION, WATER, POWER, OTHER")
    priority: str = Field(description="The urgency of the complaint: LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")

def classify_complaint_text(request: ClassificationRequest) -> ClassificationResult:
    prompt = f"""
    You are an AI assistant for a civic governance OS.
    Analyze the following citizen complaint and categorize it.
    
    Title: {request.title}
    Description: {request.description}
    
    Determine the category and priority.
    - Priorities: LOW, MEDIUM, HIGH, CRITICAL
    - If it mentions physical danger (e.g., exposed wires, open manholes), mark CRITICAL.
    - If it affects a large area (e.g., pipeline burst), mark HIGH.
    """
    
    try:
        if settings.GEMINI_API_KEY == "your_gemini_api_key_here":
            parsed = GeminiClassificationOutput(
                category="INFRASTRUCTURE",
                priority="HIGH",
                confidence=0.95
            )
        else:
            response = client.models.generate_content(
                model='gemini-1.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiClassificationOutput,
                    temperature=0.1,
                ),
            )
            parsed = GeminiClassificationOutput.model_validate_json(response.text)
        
        # TODO: Geospatial logic to determine ward_id based on lat/lng (using GeoPandas in Sprint 4)
        suggested_ward = None 
        
        return ClassificationResult(
            category=parsed.category,
            priority=parsed.priority,
            suggestedWard=suggested_ward,
            confidence=parsed.confidence
        )
        
    except Exception as e:
        print(f"GenAI Error: {e}")
        # Fallback response
        return ClassificationResult(
            category="OTHER",
            priority="MEDIUM",
            confidence=0.0
        )
