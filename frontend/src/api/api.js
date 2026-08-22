// api.js configures a reusable Axios instance for making HTTP requests.
import axios from 'axios';

// We use an environment variable for the base URL so it can be changed for production.
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';

// Create an Axios instance with pre-configured settings.
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
