import apiClient from '@/lib/api/client.js';

export const fetchParts = async () => {
  const { data } = await apiClient.get('/parts');
  return data;
};

export const createPart = async (payload) => {
  const { data } = await apiClient.post('/parts', payload);
  return data;
};

export const updatePart = async (id, payload) => {
  const { data } = await apiClient.patch(`/parts/${id}`, payload);
  return data;
};

export const deletePart = async (id) => {
  await apiClient.delete(`/parts/${id}`);
};
