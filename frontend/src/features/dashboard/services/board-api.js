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
  windowMs,
}) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/telemetry`, {
    params: {
      limit,
      since,
      windowMs,
    },
  });
  return data;
};

export const fetchMachineTelemetryTrend = async ({
  machineId,
  rangeHours,
  binMinutes,
}) => {
  const { data } = await apiClient.get(`/board/machines/${machineId}/trend`, {
    params: {
      rangeHours,
      binMinutes,
    },
  });
  return data;
};
