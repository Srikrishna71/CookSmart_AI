import axios from 'axios';
import { Recipe } from '@/data/mockRecipes';

// API base URL - configure this when backend is ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Recipe API endpoints
export const recipeApi = {
  getAll: async (params?: { cuisine?: string; category?: string; search?: string }) => {
    // TODO: Replace with actual API call when backend is ready
    // return api.get<Recipe[]>('/recipes', { params });
    throw new Error('Backend not connected yet');
  },

  getById: async (id: string) => {
    // TODO: Replace with actual API call
    // return api.get<Recipe>(`/recipes/${id}`);
    throw new Error('Backend not connected yet');
  },

  create: async (recipe: Partial<Recipe>) => {
    // TODO: Replace with actual API call
    // return api.post<Recipe>('/recipes', recipe);
    throw new Error('Backend not connected yet');
  },

  update: async (id: string, recipe: Partial<Recipe>) => {
    // TODO: Replace with actual API call
    // return api.put<Recipe>(`/recipes/${id}`, recipe);
    throw new Error('Backend not connected yet');
  },

  delete: async (id: string) => {
    // TODO: Replace with actual API call
    // return api.delete(`/recipes/${id}`);
    throw new Error('Backend not connected yet');
  },

  toggleFavorite: async (id: string) => {
    // TODO: Replace with actual API call
    // return api.post(`/recipes/${id}/favorite`);
    throw new Error('Backend not connected yet');
  },
};

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    // TODO: Replace with actual API call
    // return api.post('/auth/login', { email, password });
    throw new Error('Backend not connected yet');
  },

  register: async (email: string, password: string, name: string) => {
    // TODO: Replace with actual API call
    // return api.post('/auth/register', { email, password, name });
    throw new Error('Backend not connected yet');
  },

  logout: async () => {
    // TODO: Replace with actual API call
    // return api.post('/auth/logout');
    localStorage.removeItem('authToken');
  },
};

// User API endpoints
export const userApi = {
  getProfile: async () => {
    // TODO: Replace with actual API call
    // return api.get('/user/profile');
    throw new Error('Backend not connected yet');
  },

  updateProfile: async (data: any) => {
    // TODO: Replace with actual API call
    // return api.put('/user/profile', data);
    throw new Error('Backend not connected yet');
  },
};

export default api;
