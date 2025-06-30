import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const initCanvas = async (width, height) => {
  const response = await apiClient.post('/canvas/init', { width, height });
  return response.data;
};

const addRectangle = async (data) => {
  const response = await apiClient.post('/canvas/rectangle', data);
  return response.data;
};

const addCircle = async (data) => {
  const response = await apiClient.post('/canvas/circle', data);
  return response.data;
};

const addText = async (data) => {
  const response = await apiClient.post('/canvas/text', data);
  return response.data;
};

const updateElementText = async (id, text, fontSize, bold, italic, underline) => {
  const response = await apiClient.put(`/canvas/element/${id}/text`, { text, fontSize, bold, italic, underline });
  return response.data;
};

const addImageUrl = async (data) => {
  const response = await apiClient.post('/canvas/image', data);
  return response.data;
};

const addImageFile = async (data) => {
  const formData = new FormData();
  formData.append('image', data.file);
  formData.append('x', data.x);
  formData.append('y', data.y);
  formData.append('width', data.width);
  formData.append('height', data.height);

  const response = await axios.post(`${apiClient.defaults.baseURL}/canvas/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

const updateElementPosition = async (id, x, y) => {
  const response = await apiClient.put(`/canvas/element/${id}/position`, { x, y });
  return response.data;
};

const updateElementSize = async (id, sizeData) => {
  const response = await apiClient.put(`/canvas/element/${id}/size`, sizeData);
  return response.data;
};

const exportToPDF = async (canvasState) => {
  const response = await apiClient.get('/export/pdf');
  return response.data;
};

export default {
  initCanvas,
  addRectangle,
  addCircle,
  addText,
  updateElementText,
  addImageUrl,
  addImageFile,
  updateElementPosition,
  updateElementSize,
  exportToPDF,
};
