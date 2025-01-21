import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response.data; // Return the data directly
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export { apiClient };