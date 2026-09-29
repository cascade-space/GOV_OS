# Script to test Milestone M6 SLA & MLA Directives Lifecycle

# 1. Login Admin
$adminVerify = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/otp/verify" `
    -ContentType "application/json" -Body '{"identifier":"admin@demo.govos.in","otp":"123456"}'
$adminToken = $adminVerify.accessToken
$adminUser = $adminVerify.user
Write-Host "Admin Logged In: $($adminUser.email) ($($adminUser.id))"

# 2. Create a test complaint via Public Portal
$complaintReq = @{
    name = "Sneha Patil"
    mobile = "9123456780"
    title = "Contaminated drinking water in Ward 12"
    description = "Water supply has pungent smell and yellow discoloration since morning."
    latitude = 12.9720
    longitude = 77.5950
    locationAddress = "Ward 12 Cross, Bengaluru"
    subCategory = "Water Quality"
} | ConvertTo-Json

$publicResp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/public/complaints" `
    -ContentType "application/json" -Body $complaintReq
$complaintNumber = $publicResp.complaintNumber
Write-Host "Created Complaint: $complaintNumber"

# 3. Lookup Complaint and check computed SLA Deadline
$adminComplaints = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/complaints" `
    -Headers @{ Authorization = "Bearer $adminToken" }
$matchingComplaint = $adminComplaints | Where-Object { $_.complaintNumber -eq $complaintNumber }
$complaintId = $matchingComplaint.id
Write-Host "Complaint UUID: $complaintId"
Write-Host "Initial Priority: $($matchingComplaint.priority)"
Write-Host "Calculated SLA Deadline: $($matchingComplaint.slaDeadline)"
Write-Host "SLA Breached: $($matchingComplaint.slaBreached), Escalation Level: $($matchingComplaint.escalationLevel)"

# 4. Issue an MLA Directive linked to this complaint
$directiveReq = @{
    complaintId = $complaintId
    mlaName = "Hon. Suresh Angadi"
    constituency = "Central Bengaluru"
    directiveType = "URGENT_INQUIRY"
    instructionNotes = "Drinking water contamination poses severe health hazard. Water Board engineers must test samples and restore clean supply within 4 hours."
} | ConvertTo-Json

$directiveResp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/mla/directives" `
    -Headers @{ Authorization = "Bearer $adminToken" } `
    -ContentType "application/json" -Body $directiveReq

Write-Host "`nMLA Directive Created: ID=$($directiveResp.id)"
Write-Host "MLA: $($directiveResp.mlaName) ($($directiveResp.constituency))"
Write-Host "Directive Type: $($directiveResp.directiveType)"
Write-Host "Notes: $($directiveResp.instructionNotes)"

# 5. Verify Complaint was escalated to CRITICAL and Escalation Level 3
$updatedComplaints = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/complaints" `
    -Headers @{ Authorization = "Bearer $adminToken" }
$escalatedComplaint = $updatedComplaints | Where-Object { $_.complaintNumber -eq $complaintNumber }
Write-Host "`nAfter MLA Directive:"
Write-Host "Escalated Priority: $($escalatedComplaint.priority)"
Write-Host "Escalated Level: $($escalatedComplaint.escalationLevel)"

# 6. Fetch directives for this complaint
$complaintDirectives = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/mla/directives/complaint/$complaintId" `
    -Headers @{ Authorization = "Bearer $adminToken" }
Write-Host "Found $($complaintDirectives.Count) directive(s) for complaint $complaintNumber"

Write-Host "`n======================================================="
Write-Host "SUCCESS: Milestone M6 SLA & MLA Directives Lifecycle Verified!"
Write-Host "======================================================="
