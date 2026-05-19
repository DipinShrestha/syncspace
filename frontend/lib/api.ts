import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Types for card data (used in addCard and updateCard)
interface CardData {
  title?: string;
  description?: string;
  dueDate?: string;
  labels?: string[];
  assignedTo?: string;
  position?: number;
  boardId?: string;
  targetListIndex?: number;
  newPosition?: number;
}

// Auth
export const register = (name: string, email: string, password: string) =>
  api.post('/auth/register', { name, email, password });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const getMe = () => api.get('/auth/me');

// Workspaces
export const getWorkspaces = () => api.get('/workspaces');
export const createWorkspace = (data: { name: string; description?: string }) =>
  api.post('/workspaces', data);

export const inviteMember = (workspaceId: string, email: string) =>
  api.post(`/workspaces/${workspaceId}/members`, { email });

// Boards
export const getBoardsByWorkspace = (workspaceId: string) =>
  api.get(`/boards/workspace/${workspaceId}`);
export const createBoard = (data: { title: string; workspaceId: string }) =>
  api.post('/boards', data);
export const addList = (boardId: string, title: string) =>
  api.post(`/boards/${boardId}/lists`, { title });
export const addCard = (boardId: string, listIndex: number, data: CardData) =>
  api.post(`/boards/${boardId}/lists/${listIndex}/cards`, data);
export const updateCard = (cardId: string, data: CardData) =>
  api.put(`/cards/${cardId}`, data);

// Documents
export const getDocumentsByWorkspace = (workspaceId: string) =>
  api.get(`/documents/workspace/${workspaceId}`);
export const createDocument = (data: { title: string; content: string; workspaceId: string }) =>
  api.post('/documents', data);
export const updateDocument = (id: string, data: { title?: string; content?: string }) =>
  api.put(`/documents/${id}`, data);
export const deleteDocument = (id: string) => api.delete(`/documents/${id}`);

export default api;