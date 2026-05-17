import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

export const getStats = () => api.get('/api/messages/stats/summary');
export const getMessages = (params) => api.get('/api/messages/', { params });
export const addMessage = (data) => api.post('/api/messages/', data);
export const deleteMessage = (id) => api.delete('/api/messages/' + id);
export const getTeamMembers = () => api.get('/api/messages/team/members');
export const addTeamMember = (data) => api.post('/api/messages/team/members', data);
export const askQuestion = (data) => api.post('/api/query/ask', data);
export const getQueryHistory = () => api.get('/api/query/history');
export const getSuggestions = () => api.get('/api/query/suggestions');
export const simulateWhatsApp = (data) => api.post('/webhook/simulate', data);
