import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { mapAxiosError } from '@/shared/api/map-axios-error.ts'

function attachRequestMetadata(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  config.headers.set('X-Request-Id', crypto.randomUUID())

  // Auth seam: attach bearer token when real API auth lands.
  return config
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(attachRequestMetadata)

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(mapAxiosError(error)),
)
