// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleResponse = async (response) => {
  // Log the response details for debugging
  console.log('API Response:', {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    // Get the error message from the response if possible
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || 'API request failed';
    } catch {
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const apiClient = {
  get: async (endpoint) => {
    // Log the request details
    console.log('Making GET request to:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return handleResponse(response);
  },

  post: async (endpoint, data) => {
    // Log the request details
    console.log('Making POST request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request data:', data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
      // Add credentials if your API requires them
      credentials: 'include'
    });
    return handleResponse(response);
  },

  put: async (endpoint, data) => {
    console.log('Making PUT request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Request data:', data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return handleResponse(response);
  },

  delete: async (endpoint) => {
    console.log('Making DELETE request to:', `${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      credentials: 'include'
    });
    return handleResponse(response);
  }
};