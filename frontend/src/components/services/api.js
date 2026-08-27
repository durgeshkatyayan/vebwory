import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!['/auth', '/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => (await apiClient.post('/auth/login', credentials)).data;
export const signup = async (details) => (await apiClient.post('/auth/signup', details)).data;
export const loginUser = login;
export const registerUser = signup;

export const getDashboardMetrics = async () => {
  const response = await apiClient.get('/dashboard');
  return response.data;
};

export const getTasks = async (params = {}) => {
  const response = await apiClient.get('/tasks', { params });
  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (taskData) => {
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (taskId, taskData) => {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiClient.delete(`/tasks/${taskId}`);
  return response.data;
};

export const addTaskComment = async (taskId, commentData) => {
  const response = await apiClient.post(`/tasks/${taskId}/comments`, commentData);
  return response.data;
};

export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getExternalUsers = async () => {
  const response = await apiClient.get('/external/users');
  return response.data;
};

export const getExternalPhotos = async (page = 1, limit = 24) => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/photos', {
    params: { _page: page, _limit: limit },
  });
  return response.data;
};

export default apiClient;