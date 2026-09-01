# Workflow: /run:tests
# Execute test suites for specific services

---

## Trigger
`/run:tests {service}`

**Examples:**
- `/run:tests core-api`
- `/run:tests web`
- `/run:tests all`

---

## Test Commands Per Service

### govos-core-api (Spring Boot)
```bash
cd govos-core-api
./mvnw test                               # All unit tests
./mvnw test -Dtest={ClassName}            # Specific test class
./mvnw verify -P integration-test         # Integration tests (requires DB)
./mvnw jacoco:report                      # Coverage report → target/site/jacoco/
```

**Coverage Targets:** Minimum 80% line coverage on `application/` and `domain/` packages.

### govos-realtime (NestJS)
```bash
cd govos-realtime
npm run test                              # All unit tests (Jest)
npm run test:watch                        # Watch mode
npm run test:cov                          # Coverage report
npm run test:e2e                          # E2E tests
```

**Coverage Targets:** Minimum 75% line coverage.

### govos-ai (Python FastAPI)
```bash
cd govos-ai
python -m pytest                          # All tests
python -m pytest tests/ -v               # Verbose
python -m pytest tests/ --cov=app        # Coverage
python -m pytest tests/test_geo.py       # Specific test file
```

**Coverage Targets:** Minimum 75% line coverage on `core/` package.

### govos-web (React)
```bash
cd govos-web
npm run test                              # Vitest unit tests
npm run test:ui                           # Vitest UI mode
npm run test:coverage                     # Coverage report
npx playwright test                       # E2E tests
```

**Coverage Targets:** Unit tests for all hooks and store slices.

### All Services
```bash
# Run from root GovOS/
docker-compose -f infra/docker/docker-compose.test.yml up --abort-on-container-exit
```

---

## Critical E2E Test Scenarios (Playwright)

These scenarios MUST pass before any release:

1. **Full Complaint Lifecycle:**
   - Citizen files complaint → Officer receives WebSocket assignment → Officer marks resolved → Citizen receives SMS → Complaint auto-closes after 72h

2. **SLA Breach Flow:**
   - Complaint assigned → SLA warning fires at 75% → SLA breach fires at 100% → Escalation notification to Rep

3. **MFA Login:**
   - Officer logs in with OTP → MFA TOTP verification → Access granted → Attempt admin panel → 403 received → Own queue accessible

4. **Tenant Isolation:**
   - Tenant A officer cannot access Tenant B complaints → 403 returned → Audit log records attempt

5. **Mass Broadcast:**
   - Rep sends ward message → All ward citizens receive SMS + in-app notification

6. **Document Movement (Peshi):**
   - Officer uploads inward document → Routes to another department → Receiving officer confirms receipt

---

## Test Failure Protocol
If tests fail during scaffolding:
1. Report the failing test name and error message
2. Identify whether it's a unit, integration, or E2E failure
3. **NFTR Self-Healing (FAULT-N6):** Attempt auto-fix for simple failures by diagnosing the root cause. NEVER blindly change assertions to match failing output without verifying if the underlying business logic or contract changed.
4. For complex failures, output a `FAILING_TEST_REPORT.md` with full context
5. NEVER skip or suppress a failing test
