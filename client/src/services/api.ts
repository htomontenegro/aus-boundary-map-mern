import axios from 'axios';
import type { Entry, Category, Settings, PaginatedEntries } from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('bm_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// ── Public ─────────────────────────────────────────────────────────────────
export const fetchPublicEntries    = (): Promise<Entry[]>    => api.get('/entries/public').then(r => r.data);
export const fetchPublicCategories = (): Promise<Category[]> => api.get('/categories/public').then(r => r.data);

// ── Admin: Entries ──────────────────────────────────────────────────────────
export const fetchAdminEntries = (params?: Record<string, unknown>): Promise<PaginatedEntries> =>
  api.get('/entries', { params }).then(r => r.data);

export const fetchEntry  = (id: string): Promise<Entry>  => api.get(`/entries/${id}`).then(r => r.data);
export const createEntry = (data: Partial<Entry>): Promise<Entry> => api.post('/entries', data).then(r => r.data);
export const updateEntry = (id: string, data: Partial<Entry>): Promise<Entry> => api.put(`/entries/${id}`, data).then(r => r.data);
export const deleteEntry = (id: string): Promise<void> => api.delete(`/entries/${id}`).then(r => r.data);
export const bulkEntries = (body: { ids: string[]; action: string; status?: string }): Promise<void> =>
  api.post('/entries/bulk', body).then(r => r.data);

// ── Admin: Categories ───────────────────────────────────────────────────────
export const fetchAdminCategories = (): Promise<Category[]> => api.get('/categories').then(r => r.data);
export const createCategory = (data: Partial<Category>): Promise<Category> => api.post('/categories', data).then(r => r.data);
export const updateCategory = (id: string, data: Partial<Category>): Promise<Category> => api.put(`/categories/${id}`, data).then(r => r.data);
export const deleteCategory = (id: string): Promise<void> => api.delete(`/categories/${id}`).then(r => r.data);

// ── Admin: Settings ─────────────────────────────────────────────────────────
export const fetchSettings = (): Promise<Settings> => api.get('/settings').then(r => r.data);
export const saveSettings  = (data: Partial<Settings>): Promise<Settings> => api.put('/settings', data).then(r => r.data);

// ── Auth ────────────────────────────────────────────────────────────────────
export const login   = (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data);
export const fetchMe = () => api.get('/auth/me').then(r => r.data);
