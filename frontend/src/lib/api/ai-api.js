import apiClient from '@/lib/api/client.js';

export const fetchAiInsights = async (params) => {
  const { data } = await apiClient.get('/ai/insights', { params });
  return data;
};

export const fetchLatestAiInsight = async (params) => {
  const { data } = await apiClient.get('/ai/insights/latest', { params });
  return data;
};

export const fetchAiInsightById = async (id) => {
  const { data } = await apiClient.get(`/ai/insights/${id}`);
  return data;
};

export const createOeeInsight = async (payload) => {
  const { data } = await apiClient.post('/ai/oee-insight', payload);
  return data;
};

export const createDowntimeReasonInsight = async (payload) => {
  const { data } = await apiClient.post('/ai/downtime-reason', payload);
  return data;
};

export const createAnomalyRiskInsight = async (payload) => {
  const { data } = await apiClient.post('/ai/anomaly-risk', payload);
  return data;
};
