import axios from 'axios';

// Declare Clerk on the window object for TypeScript
declare global {
  interface Window {
    Clerk: any;
  }
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach the Clerk JWT token on the client-side
api.interceptors.request.use(
  async (config) => {
    // Check if we are running in the browser and Clerk is loaded
    if (typeof window !== 'undefined' && window.Clerk && window.Clerk.session) {
      try {
        const token = await window.Clerk.session.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to fetch Clerk token for API request', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
