export interface GeoFeature {
  id: string;
  tenantId: string;
  type: 'COMPLAINT' | 'ASSET' | 'PROJECT' | string;
  title: string;
  latitude: number;
  longitude: number;
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}
