import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default api;

export interface DogMedia {
  url: string;
  type: 'image' | 'video';
}

export interface V2Dog {
  _id: string;
  name: string;
  breed: string;
  age: number;
  healthStatus: string;
  vaccinated: boolean;
  adopted: boolean;
  description: string;
  media?: DogMedia[];
  location: { address: string; coordinates?: [number, number] };
  listedBy?: { _id: string; name: string; email?: string; phone?: string; address?: string };
  gender?: string;
  size?: string;
}

export function getDogImageUrl(dog: { media?: DogMedia[] }): string | null {
  const url = dog.media?.[0]?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
}

export function formatDogAge(ageMonths: number): string {
  if (ageMonths <= 12) return ageMonths <= 1 ? 'Puppy' : `${Math.round(ageMonths / 12) || 1} yr`;
  const years = Math.round(ageMonths / 12);
  return years === 1 ? '1 yr' : `${years} yrs`;
}

export function getDogLocation(dog: V2Dog): string {
  return dog.location?.address || 'Tamil Nadu';
}

// Auth
export const loginUser = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
  address?: string;
}) => api.post('/auth/register', data);

export const getMe = () => api.get('/auth/me');

// Dogs (v2)
export const browseDogs = (params?: Record<string, string | number | boolean>) =>
  api.get('/dogs-v2', { params: { limit: 50, ...params } });

export const getDogDetails = (id: string) => api.get(`/dogs-v2/${id}`);

export const createDog = (data: FormData) =>
  api.post('/dogs-v2', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateDog = (id: string, data: FormData) =>
  api.put(`/dogs-v2/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteDog = (id: string) => api.delete(`/dogs-v2/${id}`);

export const toggleDogAdoptedStatus = (id: string, adopted: boolean) =>
  api.patch(`/dogs-v2/${id}/adopted`, { adopted });

export const getMyListings = () => api.get('/dogs-v2/my-listings');

// Applications (v2)
export const submitApplication = (data: {
  dogId: string;
  reasonForAdopting: string;
  hasOtherPets: boolean;
  otherPetsDescription?: string;
  familyMembersCount: number;
  agreeToHomeVisit: boolean;
  adopterPhone?: string;
  adopterWhatsApp?: string;
  adopterCity?: string;
}) => api.post('/applications', data);

export const getApplications = () => api.get('/applications');

export const updateApplicationStatus = (
  id: string,
  status: string,
  extra?: { rejectionReason?: string }
) => api.put(`/applications/${id}/status`, { status, ...extra });

// Interview scheduling
export const proposeInterview = (
  applicationId: string,
  interviewDate: string,
  interviewNotes?: string
) => api.post(`/applications/${applicationId}/interview/propose`, { interviewDate, interviewNotes });

export const respondToInterview = (
  applicationId: string,
  response: 'confirm' | 'request_change' | 'decline',
  counterProposalDate?: string,
  notes?: string
) => api.post(`/applications/${applicationId}/interview/respond`, { response, counterProposalDate, notes });

// Notifications
export const getNotifications = (unreadOnly?: boolean) => 
  api.get('/notifications', { params: { unreadOnly } });

export const markNotificationAsRead = (notificationId: string) =>
  api.put(`/notifications/${notificationId}/read`);

export const markAllNotificationsAsRead = () =>
  api.put('/notifications/read-all');

export const deleteNotification = (notificationId: string) =>
  api.delete(`/notifications/${notificationId}`);

// Password reset
export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword });

// Stats
export const getStats = () => api.get('/stats');
