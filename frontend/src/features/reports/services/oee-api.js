import apiClient from '@/lib/api/client.js';

export const fetchOeeStats = async (params) => {
  const { data } = await apiClient.get('/oee/stats', { params });
  return data;
};
