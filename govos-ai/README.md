# govos-ai — Python FastAPI AI Service

**GovOS Multi-Tenant Civic Governance Platform**
*Prajna Labs × Cascade Technologies Solutions*

---

## Overview

The AI Service is the intelligence layer of GovOS. It powers AI-assisted governance using Google Gemini (via Vertex AI), resolves GPS coordinates to ward boundaries using GeoPandas, and runs the dynamic workload allocation algorithm.

**Tech Stack:** Python 3.12 · FastAPI · Google Gen AI SDK · GeoPandas · asyncpg · Redis · OpenSearch

---

## Package Structure

```
app/
├── api/routes/      ← Route handlers (ai, geo, allocation)
├── core/ai/         ← Gemini client, function tools, prompt manager
├── core/geo/        ← Ward resolver, OpenStreetMap client
├── core/allocation/ ← Workload balancer, SLA monitor
├── models/          ← Pydantic v2 schemas
├── prompts/         ← LLM prompt templates (.txt files)
└── services/        ← Business logic layer
```

## Quick Start

```bash
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

cp .env.example .env
# Edit .env — requires GCP_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS

uvicorn app.main:app --reload --port 8000
# API docs at http://localhost:8000/docs
```

## Testing

```bash
python -m pytest tests/ -v
python -m pytest tests/ --cov=app
```

## Key Routes

- `POST /api/v1/ai/classify` — Complaint classification
- `POST /api/v1/ai/chat` — AI governance assistant
- `GET  /api/v1/geo/resolve-ward` — GPS → Ward resolution
- `POST /api/v1/allocation/assign` — Optimal officer assignment

---

## AntiGravity IDE
- Active Agent: **AIEngineer**
- Rules file: `.rules` (in this directory)
- Read `.rules` before any code generation task
