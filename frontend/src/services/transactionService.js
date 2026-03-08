import api from './api';

const transactionService = {
  getByAccountId: async (accountId, page = 1, perPage = 20) => {
    const response = await api.get(`/transactions/account/${accountId}`, {
      params: {
        page,
        per_page: perPage,
      },
    });
    return response.data;
  },

  getById: async (transactionId) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },

  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  update: async (transactionId, transactionData) => {
    const response = await api.put(`/transactions/${transactionId}`, transactionData);
    return response.data;
  },

  delete: async (transactionId) => {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
  },
};

export default transactionService;