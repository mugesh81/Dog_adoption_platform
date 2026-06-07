import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const registerDonor = (data: {
  name: string;
  email: string;
  phone: string;
  address: string;
}) => api.post('/donors/register', data);

export const addDog = (donorId: string, data: FormData) =>
  api.post(`/donors/${donorId}/dogs`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const registerAdopter = (data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  homeType: string;
}) => api.post('/adopters/register', data);

export const browseDogs = (params?: Record<string, string | number | boolean>) =>
  api.get('/dogs', { params });

export const getDogDetails = (id: string) => api.get(`/dogs/${id}`);

export const sendAdoptionRequest = (data: {
  dogId: string;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  message?: string;
}) => api.post('/adopters/adopt', data);

export const adoptDog = (
  dogId: string,
  data = {
    adopterName: 'Interested adopter',
    adopterEmail: 'adopter@example.com',
    adopterPhone: '9999999999',
    message: 'I would like to adopt this dog.',
  }
) => api.post('/adopters/adopt', { dogId, ...data });

export const getRequestsByDog = (dogId: string) =>
  api.get(`/adopters/requests/dog/${dogId}`);

export const getAdoptionRequests = () => api.get('/adopters/requests');

export const updateAdoptionRequest = (id: string, status: 'approved' | 'rejected') => 
  api.put(`/adopters/requests/${id}`, { status });

export const getStats = () => api.get('/stats');
