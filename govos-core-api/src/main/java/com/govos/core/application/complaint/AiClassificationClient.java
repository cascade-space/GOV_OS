package com.govos.core.application.complaint;

import com.govos.core.domain.complaint.Priority;
import java.util.UUID;

public interface AiClassificationClient {
    
    record AiResult(String category, Priority priority, UUID suggestedWard) {}
    record AllocationResult(UUID officerId, String reasoning) {}
    
    AiResult classifyComplaint(String title, String description, Double latitude, Double longitude);
    
    AllocationResult allocateOfficer(UUID complaintId, String category, Priority priority, UUID wardId, java.util.List<com.govos.core.domain.officer.OfficerProfile> availableOfficers);
}
