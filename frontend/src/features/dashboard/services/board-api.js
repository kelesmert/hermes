import apiClient from '@/lib/api/client.js';

export const fetchBoardMetrics = async () => {
  const { data } = await apiClient.get('/board/metrics');
  return data;
};

export const fetchMachineBoardMetrics = async (machineId) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/metrics`);
  return data;
};

export const fetchMachineTelemetrySeries = async ({
  machineId,
  limit = 30,
  since,
  view,
  bucketMinutes,
}) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/telemetry`, {
    params: { limit, since, view, bucketMinutes },
  });
  return data;
};
