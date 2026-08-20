import axios from 'axios';
  import type { AxiosError } from 'axios';
  export interface ApiError {
    status: number;
    code: string;
    message: string;
  }
  interface ApiErrorBody {
    statusCode: number;
    error: string;
    message: string | string[];
  }

   export interface ApiError {
    status: number;
    code: string;
    message: string;
  }

  declare module '@tanstack/react-query' {
    interface Register {
      defaultError: ApiError;
    }
  }

  export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 10000),
    headers: { 'Content-Type': 'application/json' },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => Promise.reject(toApiError(error)),
  );

  function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
    const body = error.response?.data;
    if (body?.statusCode !== undefined) {
      return {
        status: body.statusCode,
        code: body.error,
        message: Array.isArray(body.message)
          ? body.message.join('. ')
          : body.message,
      };
    }

    if (error.code === 'ECONNABORTED') {
      return {
        status: 0,
        code: 'TIMEOUT',
        message: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
      };
    }

    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'No se pudo conectar con el servidor. Comprueba que la API esté encendida.',
    };
  }