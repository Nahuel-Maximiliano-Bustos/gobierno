import axios, { AxiosError, type AxiosAdapter } from 'axios';
import { handleRequest, MockHttpError } from '@mocks/handlers';
import { toast } from '../hooks/useToast';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const mockAdapter: AxiosAdapter = async (config) => {
  try {
    const response = await handleRequest(config);
    return {
      data: response.data,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      headers: response.headers ?? {},
      config,
      request: {}
    };
  } catch (error) {
    if (error instanceof MockHttpError) {
      throw new AxiosError(error.message, String(error.status), config, {}, {
        data: { message: error.message, ...error.payload },
        status: error.status,
        statusText: error.statusText ?? 'Error',
        headers: {},
        config,
        request: {}
      });
    }
    throw error;
  }
};

export const api = axios.create({
  baseURL: '/api',
  timeout: 2000,
  adapter: mockAdapter
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${authToken}`
    };
  }
  return config;
});

type ErrorMessages = Record<number, string>;

const errorMessages: ErrorMessages = {
  401: 'Su sesión expiró, inicie sesión nuevamente.',
  403: 'No cuenta con permisos para realizar esta acción.',
  422: 'Revise la información capturada, hay campos con errores.',
  500: 'Ocurrió un incidente interno. Se registró para seguimiento.'
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; incidentId?: string }>) => {
    const status = error.response?.status ?? 500;
    const description =
      error.response?.data?.message ?? errorMessages[status] ?? 'Error inesperado en el servicio.';
    toast({
      title: `Error ${status}`,
      description,
      variant: status >= 500 ? 'destructive' : 'warning'
    });
    if (status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
