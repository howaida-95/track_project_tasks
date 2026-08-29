import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { getApiBaseUrl } from '@/shared/api/api-base-url.ts'
import { mapAxiosError } from '@/shared/api/map-axios-error.ts'

function attachRequestMetadata(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  config.headers.set('X-Request-Id', crypto.randomUUID())

  // Auth seam: attach bearer token when real API auth lands.
  return config
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
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
