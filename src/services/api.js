import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const userAPI = {
  create: (data) => API.post('/users', data),
  getById: (id) => API.get(`/users/${id}`),
  getByEmail: (email) => API.get(`/users/email/${email}`),
}

export const walletAPI = {
  create: (data) => API.post('/wallets', data),
  getByUser: (userId) => API.get(`/wallets/user/${userId}`),
  deactivate: (id) => API.delete(`/wallets/${id}`),
}

export const transactionAPI = {
  create: (data) => API.post('/transactions', data),
  getByUser: (userId) => API.get(`/transactions/user/${userId}`),
  getByRange: (userId, start, end) => API.get(`/transactions/user/${userId}/range?start=${start}&end=${end}`),
  getIncome: (userId) => API.get(`/transactions/user/${userId}/income`),
  getExpense: (userId) => API.get(`/transactions/user/${userId}/expense`),
}

export const allocationAPI = {
  createRule: (data) => API.post('/allocations/rules', data),
  getRulesByUser: (userId) => API.get(`/allocations/rules/user/${userId}`),
  getDeficits: (userId) => API.get(`/allocations/deficits/user/${userId}`),
  resolveDeficit: (id) => API.patch(`/allocations/deficits/${id}/resolve`),
}

export default API