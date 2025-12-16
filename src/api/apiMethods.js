// src/api/apiMethods.js
import apiClient from './apiClient';

export const fetchData = async ({ endpoint, params = {}, headers = {} }) => {

  try {
    const response = await apiClient.get(endpoint, { params, headers });

    return response;
  } catch (error) {
    console.error(`[apiMethods] ERROR → ${endpoint}`, error);
    throw {
      code: error.code || null,
      message: error.message || 'Unknown error',
      response: error.response || null,
      isAxiosError: true,
    };
  }
};

export const sendData = async ({
  endpoint,
  method = 'POST',
  body = {},
  headers = {},
}) => {
  const isFormData = body instanceof FormData;
  const contentType = isFormData ? {} : { 'Content-Type': 'application/json' };


  try {
    const response = await apiClient.request({
      url: endpoint,
      method,
      headers: {
        ...headers,
        ...contentType,
      },
      data: body,
    });
    return response;
  } catch (error) {
    console.error(
      `[apiMethods] ERROR → ${method.toUpperCase()} ${endpoint}`,
      error
    );
    throw {
      code: error.code || null,
      message: error.message || 'Unknown error',
      response: error.response || null,
      isAxiosError: true,
    };
  }
};
