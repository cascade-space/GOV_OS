# Workflow: /gen:spec
# Spec-Driven Development — Generate specification before coding

---

## Trigger
`/gen:spec {module_or_feature_name}`

**Examples:**
- `/gen:spec complaint-escalation`
- `/gen:spec citizen-broadcast`
- `/gen:spec ai-duplicate-detection`

---

## Description
Implements the GovOS Spec-Driven Development (SDD) methodology. Before ANY code is generated for a new feature, this workflow produces a comprehensive specification document for human review and approval. Coding only begins after the spec is approved.

---

## Output: Specification Document Template

The agent generates a file at: `docs/specs/{feature-name}-spec.md`

---

```markdown
# Feature Specification: {Feature Name}
**Status:** DRAFT — Pending Human Approval
**Author:** AntiGravity IDE (Agent: {agent_persona})
**Date:** {ISO date}
**Module:** {parent_module}

---

## 1. Executive Summary
{2-3 sentence description of what this feature does and why it exists}

## 2. Business Requirements
- BR-01: {requirement}
- BR-02: {requirement}

## 3. User Stories
| As a | I want to | So that |
|------|-----------|---------|
| Officer | ... | ... |
| Tenant Admin | ... | ... |

## 4. Database Schema Changes

### New Tables
{SQL DDL for new tables — must include tenant_id, soft delete, audit columns}

### Modified Tables
{ALTER TABLE statements}

### Migration File
`V{N}__create_{feature}_table.sql`

## 5. API Contract

### Spring Boot Core API Routes
| Method | Path | Role Required | Description |
|--------|------|---------------|-------------|
| POST | /api/v1/{feature} | OFFICER | Create |
| GET | /api/v1/{feature} | OFFICER | List (paginated) |
| GET | /api/v1/{feature}/{id} | OFFICER | Get by ID |
| PUT | /api/v1/{feature}/{id} | OFFICER | Update |
| DELETE | /api/v1/{feature}/{id} | TENANT_ADMIN | Soft delete |

### Request/Response DTOs
{Detailed JSON structure for all requests and responses}

### Python AI Service Routes (if applicable)
{AI route specifications}

### NestJS WebSocket Events (if real-time)
{Event names, payloads, room targets}

## 6. State Machine (if lifecycle entity)
```
STATE_A → STATE_B → STATE_C
             ↓
         STATE_D → STATE_B (cycle)
```
{Description of each transition trigger and side effects}

## 7. Notification Triggers
| Event | Channel | Recipients | Template |
|-------|---------|------------|----------|
| {feature}:created | SMS, In-App | Assigned Officer | {template_name} |

## 8. Audit Log Events
| Action | Trigger | Log Fields |
|--------|---------|------------|
| {FEATURE}_CREATED | On create | id, tenant_id, created_by |

## 9. Frontend UI Frames

### Frame 1: {Feature}List
- Component: `src/features/{feature}/components/{Feature}List.tsx`
- Shows: {columns/fields displayed}
- Actions: {create, view, edit, delete buttons}
- Real-time: Subscribes to `{feature}:created`, `{feature}:updated` events

### Frame 2: {Feature}Detail
- Component: `src/features/{feature}/components/{Feature}Detail.tsx`
- Shows: {full record fields}
- Actions: {available actions per role}

### Frame 3: {Feature}Form
- Component: `src/features/{feature}/components/{Feature}Form.tsx`
- Fields: {form fields with validation rules}
- Submit: {POST or PUT route}

## 10. Security Checklist
- [ ] All routes require JWT authentication
- [ ] Role-based access enforced at controller level
- [ ] Tenant isolation enforced at query level
- [ ] RLS policy created for new tables
- [ ] No hard deletes — soft delete only
- [ ] Audit log entry on every CUD operation

## 11. Open Questions
- OQ-01: {question requiring human decision}
- OQ-02: {question requiring human decision}

## 12. PVD v2 Confidence Score (Anti-Invent)
- **Evidence Strength (E):** {score 0-10 based on references in architecture documents}
- **Logic Chain (L):** {score 0-10 based on inferential hops}
- **Confidence:** {calculated % using PVD v2}
*(Note: If Evidence Strength = 0, this specification is blocked by INVENT-LOCK)*

---
**AWAITING APPROVAL** — Do not begin implementation until this document is approved by the architect.
```

---

## Spec-Driven Development Process

```
/gen:spec {feature}
        ↓
  Agent generates spec document
        ↓
  Human architect reviews:
    - Approves schema
    - Approves API contract
    - Answers open questions
    - Signs off
        ↓
  Human types: "Approved. Proceed with implementation."
        ↓
  /scaffold:feature {feature} runs (now with spec as context)
```

**CRITICAL:** Agents MUST NOT begin coding before the spec is explicitly approved. If asked to code without an approved spec, output: "SDD policy requires spec approval first. Run /gen:spec {feature} to create the specification."
