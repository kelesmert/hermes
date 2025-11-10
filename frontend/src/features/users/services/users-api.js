import apiClient from '@/lib/api/client.js';

export const fetchUsers = async () => {
  const { data } = await apiClient.get('/users');
  return data.users;
};

export const createUser = async (payload) => {
  const { data } = await apiClient.post('/users', payload);
  return data.user;
};

export const updateUser = async (id, payload) => {
  const { data } = await apiClient.patch(`/users/${id}`, payload);
  return data.user;
};

export const fetchRoles = async () => {
  const { data } = await apiClient.get('/roles');
  return data.roles;
};

export const createRole = async (payload) => {
  const { data } = await apiClient.post('/roles', payload);
  return data.role;
};

export const updateRole = async (id, payload) => {
  const { data } = await apiClient.patch(`/roles/${id}`, payload);
  return data.role;
};

export const deleteRole = async (id) => {
  const { data } = await apiClient.delete(`/roles/${id}`);
  return data;
};

export const fetchPermissions = async () => {
  const { data } = await apiClient.get('/permissions');
  return data.permissions;
};
