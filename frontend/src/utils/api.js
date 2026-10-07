import axios from 'axios';

import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api'
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Show toast for errors
    const message = error.response?.data?.error?.message || "Kutilmagan xatolik yuz berdi";
    toast.error(message);
    
    // Optionally handle 401s, 403s etc. globally here
    return Promise.reject(error);
  }
);

export const fetcher = (url) => api.get(url).then(res => res.data.data);

export default api;
