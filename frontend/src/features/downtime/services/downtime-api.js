import apiClient from '@/lib/api/client.js';

export const fetchReasonCatalog = async () => {
  const { data } = await apiClient.get('/oee/reasons');
  return data;
};

export const fetchDowntimes = async (params = {}) => {
  const { data } = await apiClient.get('/downtimes', { params });
  return data.downtimes;
};

export const updateDowntime = async (id, payload) => {
  const { data } = await apiClient.patch(`/downtimes/${id}`, payload);
  return data.downtime;
};

export const splitDowntime = async (id, payload) => {
  const { data } = await apiClient.post(`/downtimes/${id}/split`, payload);
  return data.downtime;
};

export const fetchPlannedDowntimeRules = async (params = {}) => {
  const { data } = await apiClient.get('/planned-downtime-rules', { params });
  return data.rules;
};

export const createPlannedDowntimeRule = async (payload) => {
  const { data } = await apiClient.post('/planned-downtime-rules', payload);
  return data.rule;
};

export const updatePlannedDowntimeRule = async (id, payload) => {
  const { data } = await apiClient.patch(`/planned-downtime-rules/${id}`, payload);
  return data.rule;
};

export const deletePlannedDowntimeRule = async (id) => {
  await apiClient.delete(`/planned-downtime-rules/${id}`);
};

