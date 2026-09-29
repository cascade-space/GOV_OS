import api from '../api-client';

export interface IssueDirectiveDTO {
    complaintId: string;
    mlaName: string;
    constituency: string;
    directiveType: 'EXPEDITE' | 'INSPECT' | 'REALLOCATE' | 'SPECIAL_AUDIT';
    instructionNotes: string;
}

export interface MlaDirective {
    id: string;
    complaintId: string;
    mlaName: string;
    constituency: string;
    directiveType: string;
    instructionNotes: string;
    status: string;
    createdAt: string;
    issuedByUserId: string;
}

export const directiveService = {
    /**
     * List all directives for the tenant / constituency
     * Calls: GET /api/v1/mla/directives
     */
    getDirectives: async (): Promise<MlaDirective[]> => {
        return api.get('/mla/directives');
    },

    /**
     * Issue a new executive directive on a complaint
     * Calls: POST /api/v1/mla/directives
     */
    issueDirective: async (payload: IssueDirectiveDTO): Promise<MlaDirective> => {
        return api.post('/mla/directives', payload);
    },

    /**
     * List directives for a specific complaint
     * Calls: GET /api/v1/mla/directives/complaint/{complaintId}
     */
    getByComplaint: async (complaintId: string): Promise<MlaDirective[]> => {
        return api.get(`/mla/directives/complaint/${complaintId}`);
    },
};
