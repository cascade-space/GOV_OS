import { api } from '../../../lib/api';
import { GeoFeature } from './types';

export const mapApi = {
  getFeatures: async (): Promise<GeoFeature[]> => {
    const response = await api.get('/map/features');
    return response.data;
  },
};
