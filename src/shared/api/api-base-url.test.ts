import { describe, expect, it } from 'vitest'

import { getApiBaseUrl } from '@/shared/api/api-base-url.ts'

describe('getApiBaseUrl', () => {
  it('defaults when value is missing or blank', () => {
    expect(getApiBaseUrl(undefined)).toBe('/api')
    expect(getApiBaseUrl('')).toBe('/api')
    expect(getApiBaseUrl('   ')).toBe('/api')
  })

  it('keeps a configured base and strips a trailing slash', () => {
    expect(getApiBaseUrl('/api')).toBe('/api')
    expect(getApiBaseUrl('/api/')).toBe('/api')
    expect(getApiBaseUrl('https://api.example.com/v1/')).toBe('https://api.example.com/v1')
  })
})
