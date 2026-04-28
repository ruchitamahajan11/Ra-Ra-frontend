import axios from 'axios';
import { API_CONFIG } from '../config/api.config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    // This header bypasses the ngrok warning page
    "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json'
  }
});

export default api;