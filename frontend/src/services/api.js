import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://team-task-manager-mifl.onrender.com/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');

    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    return api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  register: (userData) => api.post('/api/v1/auth/register', userData),
  getCurrentUser: () => api.get('/api/v1/users/me'),
};

export const userAPI = {
  getCurrentUser: () => api.get('/api/v1/users/me'),
  updateCurrentUser: (data) => api.put('/api/v1/users/me', data),
  getUsers: () => api.get('/api/v1/users'),
  getUser: (id) => api.get(`/api/v1/users/${id}`),
  updateUser: (id, data) => api.put(`/api/v1/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/v1/users/${id}`),
  getUserProjects: (id) => api.get(`/api/v1/users/${id}/projects`),
};

export const projectAPI = {
  getProjects: () => api.get('/api/v1/projects'),
  getProject: (id) => api.get(`/api/v1/projects/${id}`),
  createProject: (data) => api.post('/api/v1/projects', data),
  updateProject: (id, data) => api.put(`/api/v1/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/v1/projects/${id}`),
  getProjectMembers: (projectId) => api.get(`/api/v1/projects/${projectId}/members`),
  addMember: (projectId, userId) => api.post(`/api/v1/projects/${projectId}/members/${userId}`),
  removeMember: (projectId, userId) => api.delete(`/api/v1/projects/${projectId}/members/${userId}`),
};

export const taskAPI = {
  getTasks: () => api.get('/api/v1/tasks'),
  getTask: (id) => api.get(`/api/v1/tasks/${id}`),
  getTasksByProject: (projectId) => api.get(`/api/v1/tasks/project/${projectId}`),
  createTask: (data) => api.post('/api/v1/tasks', data),
  updateTask: (id, data) => api.put(`/api/v1/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/api/v1/tasks/${id}`),
  getMyTasks: () => api.get('/api/v1/tasks/my-tasks'),
  getOverdueTasks: () => api.get('/api/v1/tasks/overdue'),
};

export default api;
