export interface CivicAsset {
  id: string;
  tenantId: string;
  assetId: string;
  name: string;
  category: 'VEHICLE' | 'BUILDING' | 'STREETLIGHT' | 'INFRASTRUCTURE' | string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | string;
  latitude: number;
  longitude: number;
  nextMaintenanceDate: string;
}
