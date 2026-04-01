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

export const createPeerAvailability = async (data) => {
    const response = await api.post('/sessions/peer/availability', data);
    return response.data;
};

export const searchPeerAvailability = async (params) => {
    const response = await api.get('/sessions/peer/availability/search', { params });
    return response.data;
};

export const autoMatchPeer = async (data) => {
    const response = await api.post('/sessions/peer/match', data);
    return response.data;
};

export const bookPeerSession = async (sessionId) => {
    const response = await api.post('/sessions/peer/book', { sessionId });
    return response.data;
};

export const getUpcomingPeerSessions = async () => {
    const response = await api.get('/sessions/peer/upcoming');
    return response.data;
};

export const reschedulePeerSession = async (sessionId, payload) => {
    const response = await api.patch(`/sessions/peer/${sessionId}/reschedule`, payload);
    return response.data;
};

export const cancelPeerSession = async (sessionId) => {
    const response = await api.patch(`/sessions/peer/${sessionId}/cancel`);
    return response.data;
};

const inferExtensionFromMime = (mimeType = '') => {
    const normalized = String(mimeType).toLowerCase();
    if (normalized.includes('webm')) return 'webm';
    if (normalized.includes('wav')) return 'wav';
    if (normalized.includes('mpeg') || normalized.includes('mp3')) return 'mp3';
    if (normalized.includes('mp4') || normalized.includes('m4a')) return 'm4a';
    if (normalized.includes('ogg')) return 'ogg';
    return 'webm';
};

export const transcribeAudio = async ({
    audioBlob,
    language = 'en-US',
    diarize = true,
    detectLanguage = true,
    mimeType = 'audio/webm'
} = {}) => {
    const formData = new FormData();
    const extension = inferExtensionFromMime(mimeType || audioBlob?.type);
    formData.append('audio', audioBlob, `interview-answer-${Date.now()}.${extension}`);
    formData.append('language', language);
    formData.append('diarize', String(diarize));
    formData.append('detectLanguage', String(detectLanguage));

    const response = await api.post('/speech/transcribe', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};
