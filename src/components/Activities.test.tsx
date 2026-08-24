import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActivitiesSection } from './Activities'

function dispatchPointer(target: Element, type: string, init: { clientX?: number; pointerId?: number }) {
  const event = new Event(type, { bubbles: true })
  Object.defineProperties(event, {
    clientX: { configurable: true, value: init.clientX ?? 0 },
    pointerId: { configurable: true, value: init.pointerId ?? 1 },
  })
  fireEvent(target, event)
}

function dispatchTransition(target: Element, propertyName: string) {
  const event = new Event('transitionend', { bubbles: true })
  Object.defineProperty(event, 'propertyName', { configurable: true, value: propertyName })
  fireEvent(target, event)
}

function mockIntersectionObserver() {
  let callback: IntersectionObserverCallback | null = null
  class TestIntersectionObserver {
    constructor(nextCallback: IntersectionObserverCallback) {
      callback = nextCallback
    }

    observe() {}

    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)
  return {
    setVisible(isIntersecting: boolean) {
      callback?.(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    },
  }
}

function setPageVisibility(state: 'visible' | 'hidden') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state })
  fireEvent(document, new Event('visibilitychange'))
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
})

describe('活动相册', () => {
  it('点击箭头不会启动父级拖动 capture，并且只切换一张', () => {
    const { container } = render(<ActivitiesSection />)
    const media = container.querySelector('.album__media') as HTMLDivElement
    const capture = vi.fn()
    Object.defineProperty(media, 'setPointerCapture', { configurable: true, value: capture })

    const next = screen.getByRole('button', { name: '下一张照片' })
    fireEvent.pointerDown(next, { clientX: 300, pointerId: 1 })
    fireEvent.click(next)

    expect(capture).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('pointercancel 后不会误切图，后续 swipe 仍可用', () => {
    const { container } = render(<ActivitiesSection />)
    const media = container.querySelector('.album__media') as HTMLDivElement
    Object.defineProperty(media, 'setPointerCapture', { configurable: true, value: vi.fn() })

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 1 })
    dispatchPointer(media, 'pointercancel', { pointerId: 1 })
    dispatchPointer(media, 'pointerup', { clientX: 100, pointerId: 1 })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 3 })
    dispatchPointer(media, 'lostpointercapture', { pointerId: 3 })
    dispatchPointer(media, 'pointerup', { clientX: 100, pointerId: 3 })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 2 })
    dispatchPointer(media, 'pointerup', { clientX: 200, pointerId: 2 })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('横向 swipe 遵守 42px 阈值并支持正反方向', () => {
    const { container } = render(<ActivitiesSection />)
    const media = container.querySelector('.album__media') as HTMLDivElement
    const release = vi.fn()
    Object.defineProperty(media, 'setPointerCapture', { configurable: true, value: vi.fn() })
    Object.defineProperty(media, 'hasPointerCapture', { configurable: true, value: vi.fn(() => false) })
    Object.defineProperty(media, 'releasePointerCapture', { configurable: true, value: release })

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 1 })
    dispatchPointer(media, 'pointerup', { clientX: 270, pointerId: 1 })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 2 })
    dispatchPointer(media, 'pointerup', { clientX: 200, pointerId: 2 })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')

    dispatchPointer(media, 'pointerdown', { clientX: 200, pointerId: 3 })
    dispatchPointer(media, 'pointerup', { clientX: 300, pointerId: 3 })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
    expect(release).not.toHaveBeenCalled()
  })

  it('点击下一张时同步更新标题和当前指示器', () => {
    render(<ActivitiesSection />)
    const before = screen.getByRole('heading', { level: 3 }).textContent
    fireEvent.click(screen.getByRole('button', { name: '下一张照片' }))

    expect(screen.getByRole('heading', { level: 3 }).textContent).not.toBe(before)
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('拖动期间暂停自动播放，释放后重新等待完整周期', () => {
    vi.useFakeTimers()
    const { container } = render(<ActivitiesSection />)
    const media = container.querySelector('.album__media') as HTMLDivElement

    dispatchPointer(media, 'pointerdown', { clientX: 300, pointerId: 1 })
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    dispatchPointer(media, 'pointerup', { clientX: 300, pointerId: 1 })
    act(() => {
      vi.advanceTimersByTime(4499)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
    vi.useRealTimers()
  })

  it('手动切换会重置自动播放计时，不会发生双跳', () => {
    vi.useFakeTimers()
    render(<ActivitiesSection />)

    act(() => {
      vi.advanceTimersByTime(4400)
    })
    fireEvent.click(screen.getByRole('button', { name: '下一张照片' }))
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')

    act(() => {
      vi.advanceTimersByTime(4299)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /第 3 张/ })).toHaveAttribute('aria-pressed', 'true')
    vi.useRealTimers()
  })

  it('循环首尾的 clone 也保持当前缩放，并在 transform 结束后归位', () => {
    const { container } = render(<ActivitiesSection />)
    const next = screen.getByRole('button', { name: '下一张照片' })
    const slides = () => Array.from(container.querySelectorAll('.album__slide'))
    const track = container.querySelector('.album__track') as HTMLDivElement

    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    fireEvent.click(next)
    expect(slides()[5]).toHaveClass('is-current')
    expect(slides()[5]).toHaveAttribute('aria-hidden', 'true')

    dispatchTransition(track, 'opacity')
    expect(slides()[5]).toHaveClass('is-current')
    expect(slides()[1]).not.toHaveClass('is-current')

    dispatchTransition(track, 'transform')
    expect(slides()[1]).toHaveClass('is-current')
  })

  it('相册离屏或页面隐藏时不自动播放，恢复后重新等待完整周期', () => {
    vi.useFakeTimers()
    const observer = mockIntersectionObserver()
    render(<ActivitiesSection />)

    act(() => observer.setVisible(false))
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    act(() => observer.setVisible(true))
    setPageVisibility('hidden')
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    setPageVisibility('visible')
    act(() => {
      vi.advanceTimersByTime(4499)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('reduced motion 时不启动自动播放', () => {
    vi.useFakeTimers()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    render(<ActivitiesSection />)

    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('焦点进入相册控件时暂停，离开后恢复完整周期', () => {
    vi.useFakeTimers()
    render(<ActivitiesSection />)
    const next = screen.getByRole('button', { name: '下一张照片' })

    act(() => next.focus())
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.blur(next, { relatedTarget: null })
    act(() => {
      vi.advanceTimersByTime(4499)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('暂停按钮可以停止并恢复自动播放', () => {
    vi.useFakeTimers()
    render(<ActivitiesSection />)
    const toggle = screen.getByRole('button', { name: '暂停相册自动播放' })

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: '继续相册自动播放' })).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(9000)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.blur(toggle, { relatedTarget: null })
    fireEvent.click(screen.getByRole('button', { name: '继续相册自动播放' }))
    fireEvent.blur(screen.getByRole('button', { name: '暂停相册自动播放' }), { relatedTarget: null })
    act(() => {
      vi.advanceTimersByTime(4499)
    })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('轮播支持左右方向键，内部按钮不会重复响应', () => {
    render(<ActivitiesSection />)
    const media = screen.getByLabelText('活动照片轮播，使用左右方向键切换')
    const next = screen.getByRole('button', { name: '下一张照片' })

    act(() => media.focus())
    fireEvent.keyDown(media, { key: 'ArrowRight' })
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(media, { key: 'ArrowLeft' })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')

    act(() => next.focus())
    fireEvent.keyDown(next, { key: 'ArrowRight' })
    expect(screen.getByRole('button', { name: /第 1 张/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('只有手动切换更新屏幕阅读器状态，自动播放不播报', () => {
    vi.useFakeTimers()
    render(<ActivitiesSection />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('')

    act(() => {
      vi.advanceTimersByTime(4500)
    })
    expect(status).toHaveTextContent('')

    fireEvent.click(screen.getByRole('button', { name: '上一张照片' }))
    expect(status).toHaveTextContent('OpenClaw 快速上手指南')
  })
})
