import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BootOverlay, CountUp, LiveClock } from './common'

describe('通用动效生命周期', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('CountUp 只为一次可见动画申请 RAF，完成后停止', () => {
    let observerCallback: IntersectionObserverCallback | null = null
    const callbacks: FrameRequestCallback[] = []
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe() {}
      disconnect() {}
    })
    const request = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    vi.stubGlobal('requestAnimationFrame', request)
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.spyOn(performance, 'now').mockReturnValue(100)

    const { container } = render(<CountUp to={7} duration={1} />)
    act(() => observerCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver))
    expect(request).toHaveBeenCalledTimes(1)

    act(() => callbacks.shift()?.(100))
    act(() => callbacks.shift()?.(1100))
    expect(container.querySelector('span')).toHaveTextContent('07')
    expect(request).toHaveBeenCalledTimes(2)
  })

  it('reduced motion 直接显示最终值，不申请动画帧', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const request = vi.fn()
    vi.stubGlobal('requestAnimationFrame', request)
    const { container } = render(<CountUp to={4} />)
    expect(container.querySelector('span')).toHaveTextContent('04')
    expect(request).not.toHaveBeenCalled()
  })

  it('LiveClock 在后台停止 interval，回到前台立即同步', () => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    const setIntervalSpy = vi.spyOn(window, 'setInterval')
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval')
    render(<LiveClock />)
    expect(setIntervalSpy).not.toHaveBeenCalled()

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(setIntervalSpy).toHaveBeenCalledTimes(1)
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1)
  })

  it('BootOverlay 每个 session 只展示一次，reduced motion 直接跳过', () => {
    sessionStorage.removeItem('syit-boot-seen')
    const first = render(<BootOverlay />)
    expect(first.container.querySelector('.boot')).toBeInTheDocument()
    first.unmount()

    sessionStorage.setItem('syit-boot-seen', '1')
    const second = render(<BootOverlay />)
    expect(second.container.querySelector('.boot')).not.toBeInTheDocument()
    second.unmount()

    sessionStorage.removeItem('syit-boot-seen')
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })))
    const reduced = render(<BootOverlay />)
    expect(reduced.container.querySelector('.boot')).not.toBeInTheDocument()
    reduced.unmount()
    sessionStorage.removeItem('syit-boot-seen')
  })
})
