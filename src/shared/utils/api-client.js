import axios from 'axios';
import Cookies from 'js-cookie';
import { showToast } from './toast-service';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 18000000000,
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
  const token = Cookies.get('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handles API errors and throws appropriate error messages.
 *
 * @param {any} error - The error object received from the API request.
 * @throws {Error} - An Error object with a relevant message.
 */
const handleApiError = error => {
  console.error(error);

  if (error.response) {
    const { status, data } = error.response;
    let errorMessage = data?.message || `Error ${status}`;

    if (status === 422) {
      if (data.errors) {
        errorMessage = data.errors.map(err => err.message).join(', ');
      } else {
        errorMessage =
          'There was an issue with your input. Please check and try again.';
      }
    }

    switch (status) {
      case 401:
        errorMessage = 'Unauthorized. Please log in.';
        break;
      case 403:
        errorMessage = 'The old password entered is invalid.';
        break;
      case 404:
        errorMessage = 'Resource not found.';
        break;
      case 500:
        errorMessage = 'Server error. Try again later.';
        break;
      default:
        errorMessage = data?.message || errorMessage;
    }

    throw new Error(errorMessage);
  } else if (error.request) {
    console.error('Request made but no response:', error.request); // Log request errors
    throw new Error('Network error. Please check your connection.');
  } else {
    throw new Error(error.message);
  }
};

/**
 * Makes an API request using Axios.
 *
 * @param {Object} options - Configuration for the API request.
 * @param {string} options.endpoint - The API endpoint (e.g., "/users").
 * @param {string} [options.method="GET"] - HTTP method (GET, POST, PUT, PATCH, DELETE).
 * @param {Object} [options.body={}] - Request body (used for POST, PUT, PATCH).
 * @param {Object} [options.headers={}] - Additional headers for the request.
 * @param {Object} [options.params={}] - Query parameters for the request.
 * @param {boolean} [options.withCredentials=true] - Whether to send cookies (default is true).
 * @param {boolean} [options.suppressToast=false] - Whether to suppress toast notifications.
 * @param {string} [options.successMessage] - Custom success message for toast.
 * @returns {Promise<any>} - The API response data.
 * @throws {Error} - If the request fails.
 */
export const apiRequest = async ({
  endpoint,
  method = 'GET',
  body = {},
  headers = {},
  params = {},
  withCredentials = false,
  suppressToast = false,
  successMessage,
  baseURL,
  signal,
  refreshPage = false,
}) => {
  try {
    const requestHeaders = { ...headers };

    // If sending FormData, ensure Content-Type is not set
    if (body instanceof FormData) {
      delete requestHeaders['Content-Type'];
    } else {
      // For non-FormData requests, set Content-Type to application/json
      requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await apiClient({
      baseURL: baseURL || undefined,
      url: endpoint,
      method,
      data: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
        ? body
        : undefined,

      params,
      headers: requestHeaders,
      withCredentials,
      timeout: 18000000000,
      signal,
    });

    // Show success toast for non-GET requests
    if (!suppressToast && method.toUpperCase() !== 'GET') {
      showToast(
        successMessage || `Operation completed successfully!`,
        'success',
        3000,
        refreshPage
      );
    }

    return response.data;
  } catch (error) {
    if (
      axios.isCancel?.(error) ||
      error.name === 'CanceledError' ||
      error.name === 'AbortError'
    ) {
      return;
    }
    if (!suppressToast) {
      const errorMessage = error.response?.data?.message || error.message;
      showToast(errorMessage, 'error', 5000);
    }
    handleApiError(error);
    return error;
  }
};
