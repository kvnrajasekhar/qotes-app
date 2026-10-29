import axios, { type AxiosRequestConfig } from 'axios';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../../shared/lib/env';
import { authStorage } from '../../shared/lib/storage';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  authenticated?: boolean;
};

function responseMessage(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null || !('message' in value)) return undefined;
  const message = value.message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) return message.join(' ');
  return undefined;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    const headers: AxiosRequestConfig['headers'] = {};
    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.authenticated !== false) {
      const { accessToken } = await authStorage.getTokens();
      if (!accessToken) throw new ApiRequestError(401, 'You are signed out. Please log in again.');
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axiosClient.request<unknown>({
      url: path,
      method: options.method ?? 'GET',
      data: options.body,
      headers,
      signal: options.signal,
    });
    if (response.status === 204) return undefined as T;
    const payload = response.data;
    if (typeof payload === 'object' && payload !== null && 'data' in payload) {
      return payload.data as T;
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (axios.isCancel(error) || options.signal?.aborted) {
      const cancelled = new Error('The request was cancelled.');
      cancelled.name = 'AbortError';
      throw cancelled;
    }
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      if (status) {
        throw new ApiRequestError(
          status,
          responseMessage(error.response?.data) ?? 'The request could not be completed.',
        );
      }
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new ApiRequestError(0, `The request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`);
      }
      throw new ApiRequestError(0, 'Network error. Check your connection and try again.');
    }
    throw error;
  }
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal, authenticated = true) =>
    apiRequest<T>(path, { signal, authenticated }),
  post: <T>(path: string, body?: unknown, signal?: AbortSignal, authenticated = true) =>
    apiRequest<T>(path, { method: 'POST', body, signal, authenticated }),
  patch: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'PATCH', body, signal }),
  put: <T>(path: string, body: unknown, signal?: AbortSignal) =>
    apiRequest<T>(path, { method: 'PUT', body, signal }),
};
