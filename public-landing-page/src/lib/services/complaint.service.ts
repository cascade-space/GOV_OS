import api from '../api-client';

/**
 * DTO for submitting a complaint to the GovOS public endpoint.
 * Mapped to: POST /api/v1/public/complaints
 */
export interface CreatePublicComplaintDTO {
    name: string;             // citizenName
    mobile: string;           // citizenMobile (10 digits)
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    locationAddress?: string;
    subCategory?: string;
}

export const complaintService = {
    /**
     * Upload an attachment file to MinIO object storage.
     */
    uploadFile: async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const formData = new FormData();
            formData.append('file', file);

            // 1. Try Spring Boot Core API Storage Endpoint
            try {
                const res = await fetch(`${apiBase}/api/v1/storage/upload`, {
                    method: 'POST',
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.url) {
                        return data;
                    }
                }
            } catch (coreUploadErr) {
                console.warn('Spring Boot storage upload warning, trying fallback:', coreUploadErr);
            }

            // 2. Fallback to Next.js internal upload handler
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            return await res.json();
        } catch (err: any) {
            console.error('File upload error:', err);
            return { success: false, error: err.message || 'Upload failed' };
        }
    },

    /**
     * Submit a complaint from the public citizen portal.
     * Calls the GovOS public endpoint — no JWT required.
     */
    submitComplaint: async (data: {
        title: string;
        description: string;
        category?: string;
        subCategory?: string;
        priority?: string;
        citizenName: string;
        citizenMobile: string;
        location: { address: string; latitude: number; longitude: number; ward: string };
        attachments?: File[];
    }) => {
        let finalDescription = data.description;
        const uploadedUrls: string[] = [];

        // Upload any attached files to MinIO
        if (data.attachments && data.attachments.length > 0) {
            try {
                const uploadResults = await Promise.all(
                    data.attachments.map((f) => complaintService.uploadFile(f))
                );
                uploadResults.forEach((r) => {
                    if (r.success && r.url) {
                        uploadedUrls.push(r.url);
                    }
                });

                if (uploadedUrls.length > 0) {
                    finalDescription += `\n\n[Evidence Attachments: ${uploadedUrls.join(', ')}]`;
                }
            } catch (uploadErr) {
                console.warn('Attachments upload warning:', uploadErr);
            }
        }

        // Map to GovOS public endpoint DTO
        const payload: CreatePublicComplaintDTO = {
            name: data.citizenName,
            mobile: data.citizenMobile,
            title: data.title,
            description: finalDescription,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            locationAddress: data.location.address,
            subCategory: data.subCategory,
        };

        const response: any = await api.post('/public/complaints', payload);
        return {
            ...response,
            uploadedAttachments: uploadedUrls,
        };
    },

    /**
     * Track a complaint by its number.
     * Calls: GET /api/v1/public/complaints/{complaintNumber}
     */
    getComplaintByNumber: async (complaintNumber: string) => {
        const res: any = await api.get(`/public/complaints/${complaintNumber}`);
        if (res?.data?.complaint) {
            return {
                ...res.data.complaint,
                assignedOfficer: res.data.complaint.officer_name || res.data.complaint.assigned_officer_id,
                assignedToId: res.data.complaint.assigned_officer_id,
                history: res.data.history || [],
                comments: res.data.comments || []
            };
        }
        return res;
    },

    /**
     * Get the full audit timeline for a complaint — no auth required.
     * Calls: GET /api/v1/public/complaints/{complaintNumber}/timeline
     */
    getPublicComplaintTimeline: async (complaintNumber: string) => {
        return api.get(`/public/complaints/${complaintNumber}/timeline`);
    },

    // ── Admin/Officer actions (kept for compatibility) ──────────────────────

    getComplaints: async (params?: any) => {
        return api.get('/complaints', { params });
    },

    getComplaintById: async (id: string) => {
        const res: any = await api.get(`/complaints/${id}`);
        if (res?.data?.complaint) {
            return {
                ...res.data.complaint,
                assignedOfficer: res.data.complaint.officer_name || res.data.complaint.assigned_officer_id,
                assignedToId: res.data.complaint.assigned_officer_id,
                history: res.data.history || [],
                comments: res.data.comments || []
            };
        }
        return res;
    },

    /**
     * Citizen confirmation and rating (72-hour window)
     * Calls: POST /api/v1/public/complaints/{complaintNumber}/confirm
     */
    confirmResolution: async (complaintNumber: string, payload: { mobileNumber?: string; rating: number; feedback?: string }) => {
        return api.post(`/public/complaints/${complaintNumber}/confirm`, payload);
    },

    /**
     * Citizen contest and reopen (72-hour window, photo mandatory)
     * Calls: POST /api/v1/public/complaints/{complaintNumber}/reopen
     */
    reopenComplaint: async (complaintNumber: string, payload: { mobileNumber?: string; reason: string; evidenceUrl: string }) => {
        return api.post(`/public/complaints/${complaintNumber}/reopen`, payload);
    },

    /**
     * QC Verifier / Admin: Request Rework
     * Calls: PATCH /api/v1/complaints/{id}/request-rework
     */
    requestRework: async (id: string, reworkReason: string) => {
        return api.patch(`/complaints/${id}/request-rework`, { reworkReason });
    },

    /**
     * QC Verifier / Admin: Verify and Close
     * Calls: PATCH /api/v1/complaints/{id}/verify-close
     */
    verifyAndClose: async (id: string, notes?: string) => {
        return api.patch(`/complaints/${id}/verify-close`, { notes });
    },

    /**
     * Admin: Assign complaint to an officer
     * Calls: PATCH /api/v1/complaints/{id}/assign
     */
    assignComplaint: async (id: string, officerId: string) => {
        return api.patch(`/complaints/${id}/assign`, { 
            officerId, 
            assignedOfficer: officerId, 
            assignedDept: 'PWD' 
        });
    },

    /**
     * Field Officer: Start work on assigned complaint
     * Calls: PATCH /api/v1/complaints/{id}/start-work
     */
    startWork: async (id: string) => {
        return api.patch(`/complaints/${id}/start-work`);
    },

    /**
     * Field Officer: Complete work with evidence & notes
     * Calls: POST /api/v1/complaints/{id}/complete-work
     */
    completeWork: async (id: string, payload: { resolutionNotes: string; resolutionEvidenceUrl: string; resolutionLatitude?: number; resolutionLongitude?: number }) => {
        return api.post(`/complaints/${id}/complete-work`, payload);
    },

    /**
     * Field Officer: Get my assigned tasks
     * Calls: GET /api/v1/complaints/assigned/me
     */
    getMyTasks: async () => {
        return await api.get('/complaints/assigned/me');
    },

    /**
     * Admin/Officer: Update complaint status
     * Calls: PUT /api/v1/complaints/{id}/status
     */
    updateStatus: async (id: string, status: string, notes?: string) => {
        return api.put(`/complaints/${id}/status`, { status });
    },

    /**
     * Admin/MLA: Escalate complaint or trigger priority review
     */
    escalateComplaint: async (id: string, reason: string) => {
        return api.put(`/complaints/${id}/status`, { status: 'IN_PROGRESS' });
    },

    /**
     * Officer: Get unassigned and open complaints in their assigned ward
     * Calls: GET /api/v1/complaints?wardId={wardId}
     */
    getWardComplaints: async (wardId: string) => {
        return api.get('/complaints', { params: { wardId } });
    },

    /**
     * REP (MLA): Get complaints for their constituency
     * Calls: GET /api/v1/complaints/constituency/{constituency}
     */
    getConstituencyComplaints: async (constituency: string = 'Dharwad') => {
        return api.get(`/complaints/constituency/${encodeURIComponent(constituency)}`);
    },

    /**
     * Authenticated Citizen: Get all complaints submitted by me
     * Calls: GET /api/v1/citizen/me/complaints
     */
    getMyCitizenComplaints: async () => {
        return api.get('/complaints/my');
    },

    /**
     * Officer/Admin/REP: Get the full audit timeline for a complaint.
     * Calls: GET /api/v1/complaints/{id}/timeline
     */
    getComplaintTimeline: async (id: string) => {
        return api.get(`/complaints/${id}/timeline`);
    },
};
