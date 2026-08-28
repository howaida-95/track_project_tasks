import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue.ts'

describe('useDebouncedValue', () => {
  it('updates after the delay', () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ value, delayMs }) => useDebouncedValue(value, delayMs),
      {
        initialProps: { value: 'a', delayMs: 300 },
      },
    )

    expect(result.current).toBe('a')

    rerender({ value: 'ab', delayMs: 300 })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('ab')

    vi.useRealTimers()
  })
})
