import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(window, 'matchMedia')
  })

  it('响应 matchMedia 的 change 事件', () => {
    let onChange: (() => void) | undefined
    let mediaMatches = false
    const media = {
      get matches() {
        return mediaMatches
      },
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        onChange = listener
      }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => media),
    })

    const { result, unmount } = renderHook(() => useMediaQuery('(pointer: fine)'))
    expect(result.current).toBe(false)

    mediaMatches = true
    act(() => onChange?.())

    expect(result.current).toBe(true)
    unmount()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
