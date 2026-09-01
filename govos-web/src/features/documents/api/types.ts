export interface GovDocument {
  id: string;
  tenantId: string;
  documentNumber: string;
  title: string;
  type: 'LETTER' | 'NOTICE' | 'INTERNAL_MEMO' | 'TENDER' | string;
  status: 'DRAFT' | 'IN_TRANSIT' | 'RECEIVED' | 'ARCHIVED' | string;
  currentDesk: string;
  receivedDate: string;
}
