import apiClient from '@/lib/api/client.js';

export const fetchBoardMetrics = async () => {
  const { data } = await apiClient.get('/board/metrics');
  return data;
};

export const fetchMachineBoardMetrics = async (machineId, { source } = {}) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/metrics`, {
    params: { source },
  });
  return data;
};

export const fetchMachineTelemetrySeries = async ({
  machineId,
  limit = 30,
  since,
  view,
  bucketMinutes,
  source,
}) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/telemetry`, {
    params: { limit, since, view, bucketMinutes, source },
  });
  return data;
};

export const fetchOperationsDashboard = async ({ source, shiftDate } = {}) => {
  const { data } = await apiClient.get('/board/operations', {
    params: { source, shiftDate },
  });
  return data;
};
