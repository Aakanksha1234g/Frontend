import axios from 'axios';
import Cookies from 'js-cookie';
import { logout } from '@shared/utils/cookie-store';
import { showToast } from '@shared/utils/toast-service';
// Assumes `showToast()` is linked to toastFunction

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000000000,
  withCredentials: false,
});

// Request Interceptor
apiClient.interceptors.request.use(
  config => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('[REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

//  Response Interceptor
apiClient.interceptors.response.use(
  response => {
    const status = response?.status;
    const method = response?.config?.method?.toUpperCase();

    // Show toast only for non-GET 2xx responses
    if (status >= 200 && status < 300 && method !== 'GET') {
      showToast('Request successful', 'success', 3000);
    }

    return response;
  },
  error => {
    const status = error?.response?.status;
    const code = error?.code;
    const messageFromBackend = error?.response?.data?.detail;
    const currentPath = window.location.pathname;
    let message = 'Something went wrong. Please try again.';
    let type = 'error';
    const duration = 4000;

    // Network errors
    if (code === 'ERR_NETWORK') {
      message = 'Network error: Please check your internet connection.';
    } else if (code === 'ECONNABORTED') {
      message = 'Request timeout: Please try again later.';
    }
    else if (status === 502) {
      message = 'Bad Model Gateway Error: Please try again later.';
    } else if (status === 500 || status === 501) {
      message = 'Server error: Please try again later.';
    } else if (messageFromBackend) {
      message = messageFromBackend;
    }
    // Display error toast
    showToast(message, type, duration);

    // Redirect on 401 or 404
    if (status === 401 && currentPath !== '/login') {
      logout();
      window.location.href = '/';
    } else if (status === 404) {
      window.location.href = '/not-found?type=api404';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
