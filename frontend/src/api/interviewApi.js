import api from './client';

export const startSession = async (data) => {
    const response = await api.post('/sessions/start', data);
    return response.data;
};

export const getSession = async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
};

export const submitAnswer = async (id, data) => {
    const response = await api.post(`/sessions/${id}/answer`, data);
    return response.data;
};

export const getQuestionsFromBank = async (params) => {
    const response = await api.get('/questions', { params });
    return response.data;
};
