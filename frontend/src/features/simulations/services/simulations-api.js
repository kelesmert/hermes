import apiClient from '@/lib/api/client.js';

export const fetchSimulations = async () => {
  const { data } = await apiClient.get('/simulations');
  return data;
};

export const startSimulation = async (name) => {
  const { data } = await apiClient.post(`/simulations/${name}/start`);
  return data;
};

export const stopSimulation = async (name) => {
  const { data } = await apiClient.post(`/simulations/${name}/stop`);
  return data;
};

export const resetSimulationData = async (name) => {
  const { data } = await apiClient.post(`/simulations/${name}/reset`);
  return data;
};

export const fetchSimulationLogs = async (name, params = {}) => {
  const { data } = await apiClient.get(`/simulations/${name}/logs`, { params });
  return data;
};

export const clearSimulationLogs = async (name) => {
  const { data } = await apiClient.post(`/simulations/${name}/logs/clear`);
  return data;
};
