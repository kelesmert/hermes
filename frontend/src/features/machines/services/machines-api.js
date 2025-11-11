import apiClient from '@/lib/api/client.js';

export const fetchMachines = async () => {
  const { data } = await apiClient.get('/machines');
  return data.machines;
};

export const createMachine = async (payload) => {
  const { data } = await apiClient.post('/machines', payload);
  return data.machine;
};

export const updateMachine = async (id, payload) => {
  const { data } = await apiClient.patch(`/machines/${id}`, payload);
  return data.machine;
};

export const deleteMachine = async (id) => {
  await apiClient.delete(`/machines/${id}`, { params: { force: true } });
};

export const fetchMachineEvents = async ({ machineId, limit = 20 }) => {
  const { data } = await apiClient.get(`/machines/${machineId}/events`, {
    params: { limit },
  });
  return data.events;
};

export const createMachineEvent = async ({ machineId, payload }) => {
  const { data } = await apiClient.post(`/machines/${machineId}/events`, payload);
  return data.event;
};
