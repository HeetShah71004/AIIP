import api from './client';

export const fetchThemeCatalog = async ({ search = '', style = 'All', page = 1, limit = 80 } = {}) => {
  const response = await api.get('/resume/themes', {
    params: { search, style, page, limit }
  });
  return response.data?.data;
};
