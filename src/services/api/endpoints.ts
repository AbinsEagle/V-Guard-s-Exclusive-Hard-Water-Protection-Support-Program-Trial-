import { apiClient } from './client';
import { WaterData, ServiceVisit, ApiResponse } from '../../types';

export const waterApi = {
  getStatus: (): Promise<ApiResponse<WaterData>> =>
    apiClient.get<WaterData>('/water/status'),

  requestService: (notes?: string): Promise<ApiResponse<ServiceVisit>> =>
    apiClient.post<ServiceVisit>('/service/request', { notes }),

  getServiceHistory: (): Promise<ApiResponse<ServiceVisit[]>> =>
    apiClient.get<ServiceVisit[]>('/service/history'),
};
