import apiClient from '@/lib/api/client.js';

export const fetchJobOrders = async (params = {}) => {
  const { data } = await apiClient.get('/production/job-orders', { params });
  return data.jobOrders;
};

export const createJobOrder = async (payload) => {
  const { data } = await apiClient.post('/production/job-orders', payload);
  return data.jobOrder;
};

export const updateJobOrder = async (id, payload) => {
  const { data } = await apiClient.patch(`/production/job-orders/${id}`, payload);
  return data.jobOrder;
};

export const deleteJobOrder = async (id) => {
  await apiClient.delete(`/production/job-orders/${id}`);
};

const postJobOrderAction = async (id, action, payload) => {
  const url = `/production/job-orders/${id}/${action}`;
  const { data } = await apiClient.post(url, payload);
  return data.jobOrder;
};

export const startJobOrder = (id) => postJobOrderAction(id, 'start');
export const pauseJobOrder = (id, payload) => postJobOrderAction(id, 'pause', payload);
export const resumeJobOrder = (id) => postJobOrderAction(id, 'resume');
export const completeJobOrder = (id) => postJobOrderAction(id, 'complete');
export const cancelJobOrder = (id, payload) => postJobOrderAction(id, 'cancel', payload);
export const recordProduction = (id, payload) => postJobOrderAction(id, 'produce', payload);

export const fetchJobOrderEvents = async (id, params = {}) => {
  const { data } = await apiClient.get(`/production/job-orders/${id}/events`, { params });
  return data.events;
};
