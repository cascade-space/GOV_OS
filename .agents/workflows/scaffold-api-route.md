# Workflow: /scaffold:api-route
# Slash-command automation for scaffolding a single API route with controller, service, and test

---

## Trigger
`/scaffold:api-route {service} {method} {path}`

**Examples:**
- `/scaffold:api-route core-api POST /api/v1/complaints/{id}/escalate`
- `/scaffold:api-route ai-service POST /api/v1/ai/classify`
- `/scaffold:api-route realtime GET /api/v1/notifications`

---

## Description
Generates a single, production-ready API route with its controller method, service method, request/response DTOs, and unit test. Respects the coding conventions of the target service.

---

## Step 1 — Parse Route Intent
Determine:
- Target service: `core-api` (Spring Boot) | `realtime` (NestJS) | `ai-service` (FastAPI)
- HTTP method and path
- Required roles from context (default: OFFICER + ADMIN)
- Whether this route is tenant-scoped (default: YES)

---

## Step 2A — Spring Boot Route (core-api)

### Controller (`/presentation/{domain}/{Domain}Controller.java`)
```java
@PostMapping("/{id}/escalate")
@PreAuthorize("hasAnyRole('DEPT_HEAD', 'TENANT_ADMIN')")
@Operation(summary = "Escalate a complaint", security = @SecurityRequirement(name = "bearerAuth"))
public ResponseEntity<ComplaintResponse> escalateComplaint(
    @PathVariable UUID id,
    @RequestBody @Valid EscalateRequest request,
    @AuthenticationPrincipal JwtPrincipal principal
) {
    return ResponseEntity.ok(complaintService.escalate(id, request, principal));
}
```

### Service (`/application/{domain}/{Domain}Service.java`)
- Validates entity belongs to principal's tenant
- Executes business logic
- Publishes audit event: `auditService.log(AuditAction.COMPLAINT_ESCALATED, id, principal)`
- Publishes Redis event for real-time notification

### Request DTO
```java
public record EscalateRequest(
    @NotBlank String reason,
    @NotNull UUID supervisorId
) {}
```

### Unit Test
```java
@ExtendWith(MockitoExtension.class)
class ComplaintServiceTest {
    @Test
    void escalate_shouldPublishAuditEvent() { ... }
    
    @Test
    void escalate_throwsTenantMismatch_whenComplaintBelongsToDifferentTenant() { ... }
}
```

---

## Step 2B — NestJS Route (realtime)

### Controller or Gateway
```typescript
@Post('notifications/broadcast')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_ADMIN', 'REP')
async broadcastMessage(
  @Body() dto: BroadcastDto,
  @CurrentUser() user: JwtPayload
): Promise<BroadcastResultDto> {
  return this.notificationService.broadcast(dto, user.tenantId);
}
```

### Service + Unit Test

---

## Step 2C — FastAPI Route (ai-service)

```python
@router.post("/ai/classify", response_model=ClassificationResponse)
@limiter.limit("100/minute")
async def classify_complaint(
    request: ClassifyRequest,
    tenant_id: UUID = Depends(verify_internal_token),
    db: AsyncSession = Depends(get_db)
) -> ClassificationResponse:
    result = await ai_service.classify(request.title, request.description, tenant_id)
    return ClassificationResponse(**result)
```

### Pydantic Models + pytest test

---

## Output Files
- Controller/router file (updated, not replaced)
- Service method (added to existing service)
- Request/Response DTO files (new)
- Unit test file (new)
- OpenAPI doc comment on controller

## Validation Checklist
- [ ] Route requires authentication
- [ ] Role guard applied
- [ ] Tenant isolation enforced
- [ ] Input validated (Spring: `@Valid`, NestJS: class-validator, FastAPI: Pydantic)
- [ ] Audit log written (Core API only)
- [ ] Unit test covers happy path and tenant mismatch case
- [ ] **NFTR Check (FAULT-N2):** If modifying Spring Boot 3.x, ensure the syntax matches Java 21/Spring Boot 3.x (no legacy `javax.*` imports).
