import os
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from uuid import UUID
from app.models.allocation import AllocationRequest, AllocationResult
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

class GeminiAllocationOutput(BaseModel):
    officer_id: str = Field(description="The UUID of the selected officer")
    reasoning: str = Field(description="A short explanation of why this officer was selected (e.g., workload balancing, department match)")

def allocate_officer(request: AllocationRequest) -> AllocationResult:
    if not request.available_officers:
        raise ValueError("No officers available")
        
    officers_str = "\n".join([
        f"- ID: {o.officer_id}, Name: {o.name}, Dept: {o.department}, Workload: {o.current_workload} active issues"
        for o in request.available_officers
    ])
    
    prompt = f"""
    You are the AI Allocation Engine for a civic governance OS.
    Assign the best officer for this incoming complaint.
    
    Complaint Category: {request.category}
    Complaint Priority: {request.priority}
    
    Available Officers:
    {officers_str}
    
    Rules:
    1. Match the department logically to the category (e.g. SANITATION -> Sanitation Dept, WATER -> Infrastructure/Water).
    2. If multiple officers match, pick the one with the lowest current workload to balance the load.
    3. Return ONLY the JSON object.
    """
    
    try:
        # Use pro model for reasoning
        response = client.models.generate_content(
            model='gemini-1.5-pro',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=GeminiAllocationOutput,
                temperature=0.1,
            ),
        )
        
        parsed = GeminiAllocationOutput.model_validate_json(response.text)
        
        return AllocationResult(
            officerId=UUID(parsed.officer_id),
            reasoning=parsed.reasoning
        )
        
    except Exception as e:
        print(f"GenAI Error in allocation: {e}")
        # Fallback to simple logic: Lowest workload
        best = min(request.available_officers, key=lambda o: o.current_workload)
        return AllocationResult(
            officerId=best.officer_id,
            reasoning="Fallback: Lowest workload selected."
        )
