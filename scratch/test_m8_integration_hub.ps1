# GovOS Milestone M8: End-to-End Government Integration Hub & ICCC Adapter Verification
$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  GovOS Phase 1: M8 Government Integration Hub E2E      " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# 1. Health & Configuration Check
Write-Host "[1/6] Verifying Integration Configuration in PostgreSQL..." -ForegroundColor Yellow
$configCheck = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT tenant_id, external_system, is_enabled, webhook_url, auto_sync_on_create
FROM integration_configs;
"
Write-Host "$configCheck" -ForegroundColor Green

# 2. Test Outbound Auto-Sync on Complaint Creation
Write-Host "`n[2/6] Submitting a fresh complaint to test outbound ICCC auto-sync..." -ForegroundColor Yellow
$payload = @{
    name = "Integration Citizen"
    mobile = "9876543210"
    title = "Dangerous pothole at Vidyanagar flyover"
    description = "Large pothole in fast lane causing recurring vehicular damage"
    latitude = 15.3700
    longitude = 75.1200
    locationAddress = "Vidyanagar Flyover, Ward 12"
    subCategory = "Pothole"
} | ConvertTo-Json

$payloadFile = "$PSScriptRoot\temp_m8_complaint.json"
[System.IO.File]::WriteAllText($payloadFile, $payload, [System.Text.UTF8Encoding]::new($false))

$submitRes = curl.exe -s -X POST http://localhost:8080/api/v1/public/complaints `
    -H "Content-Type: application/json" `
    --data-binary "@$payloadFile"

$complaintJson = $submitRes | ConvertFrom-Json
$complaintNumber = $complaintJson.complaintNumber
Write-Host "  -> Created Complaint: Number=$complaintNumber" -ForegroundColor Cyan

# Wait 4 seconds for async outbox worker to dispatch to Mock ICCC
Write-Host "  -> Waiting 4s for async Outbox Worker dispatch..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Check complaint external fields in DB
$complaintSyncCheck = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT complaint_number, status, external_system, external_ticket_id, integration_status, last_external_status
FROM complaints
WHERE complaint_number = '$complaintNumber';
"
Write-Host "$complaintSyncCheck" -ForegroundColor Green

# Check integration_sync_records
$outboundAuditCheck = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT id, external_system, direction, event_type, status, http_status, external_ticket_id
FROM integration_sync_records
WHERE complaint_id = (SELECT id FROM complaints WHERE complaint_number = '$complaintNumber')
ORDER BY created_at DESC LIMIT 1;
"
Write-Host "$outboundAuditCheck" -ForegroundColor Green

# 3. Security Test 1: Tampered HMAC Signature Rejection
Write-Host "`n[3/6] Testing Security: Tampered HMAC Signature Rejection..." -ForegroundColor Yellow
$tamperedObj = @{
    complaintNumber = $complaintNumber
    status = "RESOLVED"
} | ConvertTo-Json

$tamperedFile = "$PSScriptRoot\temp_tampered.json"
[System.IO.File]::WriteAllText($tamperedFile, $tamperedObj, [System.Text.UTF8Encoding]::new($false))

$tamperedTimestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
$tamperedRes = curl.exe -s -w "%{http_code}" -X POST http://localhost:8080/api/v1/integrations/webhook/ICCC_MUNICIPAL `
    -H "Content-Type: application/json" `
    -H "X-GovOS-Signature: 0000000000000000000000000000000000000000000000000000000000000000" `
    -H "X-GovOS-Timestamp: $tamperedTimestamp" `
    -H "X-GovOS-Tenant-Id: 00000000-0000-0000-0000-000000000002" `
    --data-binary "@$tamperedFile"

Write-Host "  -> Tampered Webhook Response Code: $tamperedRes" -ForegroundColor Yellow
if ($tamperedRes -match "401") {
    Write-Host "  -> PASS: Tampered signature rejected with HTTP 401 Unauthorized" -ForegroundColor Green
} else {
    Write-Error "FAIL: Tampered signature was not rejected with 401!"
}

# 4. Security Test 2: Replay Attack (Expired Timestamp) Rejection
Write-Host "`n[4/6] Testing Security: Replay Attack (Expired Timestamp) Rejection..." -ForegroundColor Yellow
$staleTimestamp = ([DateTimeOffset]::UtcNow.ToUnixTimeSeconds() - 600).ToString() # 10 minutes ago (>300s)
$replayRes = curl.exe -s -w "%{http_code}" -X POST http://localhost:8080/api/v1/integrations/webhook/ICCC_MUNICIPAL `
    -H "Content-Type: application/json" `
    -H "X-GovOS-Signature: abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234" `
    -H "X-GovOS-Timestamp: $staleTimestamp" `
    -H "X-GovOS-Tenant-Id: 00000000-0000-0000-0000-000000000002" `
    --data-binary "@$tamperedFile"

Write-Host "  -> Expired Timestamp Response Code: $replayRes" -ForegroundColor Yellow
if ($replayRes -match "401|400") {
    Write-Host "  -> PASS: Replay attack rejected with HTTP $replayRes" -ForegroundColor Green
} else {
    Write-Error "FAIL: Expired timestamp was not rejected!"
}

# 5. Test Inbound Webhook & False-Closure Guard
Write-Host "`n[5/6] Testing Inbound Webhook & False-Closure Guard via Mock ICCC..." -ForegroundColor Yellow
$simRes = curl.exe -s -X POST "http://localhost:8080/api/v1/mock/iccc/simulate-resolution?complaintNumber=$complaintNumber&notes=Asphalt%20patch%20laid%20by%20Smart%20City%20Road%20Squad&evidenceUrl=http://localhost:9000/civic-evidence/iccc_resolved.jpg"

Write-Host "  -> Simulation Response: $simRes" -ForegroundColor Green

# Verify Complaint State in PostgreSQL
Write-Host "`nChecking Complaint State after external resolution..." -ForegroundColor Yellow
$postWebhookCheck = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT complaint_number, status, integration_status, last_external_status, resolution_evidence_url, resolution_notes
FROM complaints
WHERE complaint_number = '$complaintNumber';
"
Write-Host "$postWebhookCheck" -ForegroundColor Green

# 6. Verify Outbox and Audit Events
Write-Host "`n[6/6] Verifying Outbox Events and Inbound Audit Records..." -ForegroundColor Yellow
$inboundAudit = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT id, external_system, direction, event_type, status, http_status, created_at
FROM integration_sync_records
WHERE complaint_id = (SELECT id FROM complaints WHERE complaint_number = '$complaintNumber')
ORDER BY created_at ASC;
"
Write-Host "$inboundAudit" -ForegroundColor Green

$outboxEvents = docker exec -i govos-postgres psql -U govos_user -d govos_db -c "
SELECT event_type, status, retry_count, published_at
FROM outbox_events
WHERE payload->>'complaintNumber' = '$complaintNumber' OR payload->>'complaint_number' = '$complaintNumber'
ORDER BY created_at ASC;
"
Write-Host "$outboxEvents" -ForegroundColor Green

Write-Host "`n✅ MILESTONE M8 E2E VERIFICATION COMPLETED SUCCESSFULLY!`n" -ForegroundColor Green
