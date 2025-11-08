import apiClient from '@/lib/api/client.js';

const login = async (payload) => {
  const { data } = await apiClient.post('/auth/login', payload);
  return data;
};

const refresh = async ({ refreshToken }) => {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken });
  return data;
};

const logout = async ({ refreshToken }) => {
  await apiClient.post('/auth/logout', { refreshToken });
};

const authApi = {
  login,
  refresh,
  logout,
};

export default authApi;
