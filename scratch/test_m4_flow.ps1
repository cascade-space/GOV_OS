# Script to test Milestone M4 Officer Task Dispatch and Resolution Lifecycle

# 1. Login Admin
$adminInit = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/otp/request" `
    -ContentType "application/json" -Body '{"identifier":"admin@demo.govos.in"}'
Write-Host "Admin OTP Sent: $($adminInit.sent) to $($adminInit.maskedDestination)"

$adminVerify = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/otp/verify" `
    -ContentType "application/json" -Body '{"identifier":"admin@demo.govos.in","otp":"123456"}'
$adminToken = $adminVerify.accessToken
$adminUser = $adminVerify.user
Write-Host "Admin Logged In: $($adminUser.email) ($($adminUser.id))"

# 2. Login Officer
$officerInit = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/otp/request" `
    -ContentType "application/json" -Body '{"identifier":"officer@demo.govos.in"}'
Write-Host "Officer OTP Sent: $($officerInit.sent) to $($officerInit.maskedDestination)"

$officerVerify = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/otp/verify" `
    -ContentType "application/json" -Body '{"identifier":"officer@demo.govos.in","otp":"123456"}'
$officerToken = $officerVerify.accessToken
$officerUser = $officerVerify.user
$officerId = $officerUser.id
Write-Host "Officer Logged In: $($officerUser.email) ($officerId)"

# 3. Create a test complaint via Public Portal
$complaintReq = @{
    name = "Ramesh Kumar"
    mobile = "9876543210"
    title = "Broken water pipe in Sector 9"
    description = "Water is gushing out on the main road causing flooding."
    latitude = 12.9716
    longitude = 77.5946
    locationAddress = "Sector 9 Main Cross, Bengaluru"
    subCategory = "Pipe Leakage"
} | ConvertTo-Json

$publicResp = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/public/complaints" `
    -ContentType "application/json" -Body $complaintReq
$complaintNumber = $publicResp.complaintNumber
Write-Host "Created Complaint: $complaintNumber (Status: $($publicResp.status))"

# 4. Lookup UUID of the newly created complaint from Admin List
$adminComplaints = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/complaints" `
    -Headers @{ Authorization = "Bearer $adminToken" }
$matchingComplaint = $adminComplaints | Where-Object { $_.complaintNumber -eq $complaintNumber }
$complaintId = $matchingComplaint.id
Write-Host "Complaint UUID: $complaintId"

# 5. Admin assigns complaint to Officer
$assignBody = @{ officerId = $officerId } | ConvertTo-Json
$assignedComplaint = Invoke-RestMethod -Method Patch -Uri "http://localhost:8080/api/v1/complaints/$complaintId/assign" `
    -Headers @{ Authorization = "Bearer $adminToken" } `
    -ContentType "application/json" -Body $assignBody
Write-Host "After Assign: Status=$($assignedComplaint.status), AssignedTo=$($assignedComplaint.assignedToId)"

# 6. Officer checks assigned tasks
$myTasks = Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/complaints/assigned/me" `
    -Headers @{ Authorization = "Bearer $officerToken" }
Write-Host "Officer has $($myTasks.Count) assigned complaints. Matched complaint: $($myTasks[0].complaintNumber)"

# 7. Officer starts work
$startedComplaint = Invoke-RestMethod -Method Patch -Uri "http://localhost:8080/api/v1/complaints/$complaintId/start-work" `
    -Headers @{ Authorization = "Bearer $officerToken" }
Write-Host "After Start Work: Status=$($startedComplaint.status), WorkStartedAt=$($startedComplaint.workStartedAt)"

# 8. Officer completes work with evidence
$completeBody = @{
    resolutionNotes = "Replaced 4-inch damaged ductile iron valve and restored pressure."
    resolutionEvidenceUrl = "http://localhost:9000/govos-complaints/evidence-pipe-repaired.jpg"
} | ConvertTo-Json

$completedComplaint = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/complaints/$complaintId/complete-work" `
    -Headers @{ Authorization = "Bearer $officerToken" } `
    -ContentType "application/json" -Body $completeBody
Write-Host "After Complete Work: Status=$($completedComplaint.status), Notes=$($completedComplaint.resolutionNotes), Evidence=$($completedComplaint.resolutionEvidenceUrl), WorkCompletedAt=$($completedComplaint.workCompletedAt)"

# 9. Admin verifies and closes complaint
$verifyBody = @{ notes = "Inspection confirmed pipe replaced and water supply restored to normal." } | ConvertTo-Json
$closedComplaint = Invoke-RestMethod -Method Patch -Uri "http://localhost:8080/api/v1/complaints/$complaintId/verify-close" `
    -Headers @{ Authorization = "Bearer $adminToken" } `
    -ContentType "application/json" -Body $verifyBody
Write-Host "After Verify & Close: Status=$($closedComplaint.status), Notes=$($closedComplaint.resolutionNotes), ResolvedAt=$($closedComplaint.resolvedAt)"

Write-Host "`n======================================================="
Write-Host "SUCCESS: Milestone M4 Full Officer Lifecycle Verified!"
Write-Host "======================================================="
