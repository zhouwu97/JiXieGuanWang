import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getPointerSnapshot,
  subscribeMotion,
  subscribePointerDown,
} from './motionRuntime'

describe('motion runtime 生命周期', () => {
  const cleanups: Array<() => void> = []

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup())
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('首次订阅时注册全局事件监听器', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener')

    cleanups.push(subscribeMotion(() => undefined))

    expect(addEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function), { passive: true })
    expect(addEventListener).toHaveBeenCalledWith('pointerdown', expect.any(Function), { passive: true })
    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true })
  })

  it('首次真实 pointermove 直接初始化平滑坐标', () => {
    cleanups.push(subscribeMotion(() => undefined))
    const event = new Event('pointermove')
    Object.defineProperties(event, {
      clientX: { value: 420 },
      clientY: { value: 180 },
    })

    window.dispatchEvent(event)

    expect(getPointerSnapshot()).toMatchObject({
      targetX: 420,
      targetY: 180,
      x: 420,
      y: 180,
      active: true,
    })
  })

  it('只有最后一个订阅者离开后才移除全局监听器', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener')
    const unsubscribeMotion = subscribeMotion(() => undefined)
    const unsubscribePointerDown = subscribePointerDown(() => undefined)

    unsubscribeMotion()
    expect(removeEventListener).not.toHaveBeenCalledWith('pointermove', expect.any(Function))

    unsubscribePointerDown()
    expect(removeEventListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
  })

  it('响应式订阅只在唤醒后运行到稳定，不保持无限 RAF', () => {
    const callbacks: FrameRequestCallback[] = []
    const request = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    vi.stubGlobal('requestAnimationFrame', request)
    const unsubscribe = subscribeMotion(() => undefined, { continuous: false })

    expect(request).toHaveBeenCalledTimes(1)
    callbacks.shift()?.(16)
    expect(request).toHaveBeenCalledTimes(1)

    unsubscribe()
  })

  it('连续订阅会保持 RAF，取消后停止', () => {
    const callbacks: FrameRequestCallback[] = []
    const request = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback)
      return callbacks.length
    })
    vi.stubGlobal('requestAnimationFrame', request)
    const unsubscribe = subscribeMotion(() => undefined)

    callbacks.shift()?.(16)
    expect(request).toHaveBeenCalledTimes(2)
    unsubscribe()
    expect(vi.mocked(cancelAnimationFrame)).toHaveBeenCalled()
  })
})
