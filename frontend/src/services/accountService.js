import api from './api';

const accountService = {
  getAll: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  getById: async (accountId) => {
    const response = await api.get(`/accounts/${accountId}`);
    return response.data;
  },

  create: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },

  update: async (accountId, accountData) => {
    const response = await api.put(`/accounts/${accountId}`, accountData);
    return response.data;
  },

  delete: async (accountId) => {
    const response = await api.delete(`/accounts/${accountId}`);
    return response.data;
  },

  addUser: async (accountId, email, role = 'member') => {
    const response = await api.post(`/accounts/${accountId}/add-user`, {
      email,
      role,
    });
    return response.data;
  },
};

export default accountService;