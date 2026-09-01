package com.govos.core.application.complaint;

import com.govos.core.domain.complaint.Complaint;
import com.govos.core.domain.asset.CivicAsset;

public interface EventPublisher {
    void publishComplaintCreated(Complaint complaint);
    void publishComplaintStatusChanged(Complaint complaint);
    void publishAssetMaintenanceDue(CivicAsset asset);
    void publishDocumentRouted(com.govos.core.domain.document.GovDocument document);
}
