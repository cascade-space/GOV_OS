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
        // Map to GovOS public endpoint DTO
        const payload: CreatePublicComplaintDTO = {
            name: data.citizenName,
            mobile: data.citizenMobile,
            title: data.title,
            description: data.description,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            locationAddress: data.location.address,
            subCategory: data.subCategory,
        };

        const response = await api.post('/public/complaints', payload);
        return response;
    },

    /**
     * Track a complaint by its number.
     * Calls: GET /api/v1/public/complaints/{complaintNumber}
     */
    getComplaintByNumber: async (complaintNumber: string) => {
        return api.get(`/public/complaints/${complaintNumber}`);
    },

    // ── Admin/Officer actions (kept for compatibility) ──────────────────────

    getComplaints: async (params?: any) => {
        return api.get('/complaints', { params });
    },

    getComplaintById: async (id: string) => {
        return api.get(`/complaints/${id}`);
    },
};
