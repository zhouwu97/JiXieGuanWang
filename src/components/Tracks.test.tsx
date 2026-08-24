import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { TracksSection } from './Tracks'
import type { TrackId } from '../data/tracks'
import { TRACK_ENTER_WATCHDOG_MS, TRACK_EXIT_WATCHDOG_MS } from '../motion/trackTransition'

function Harness({ initial = 'ai-fullstack' as TrackId }: { initial?: TrackId }) {
  const [activeId, setActiveId] = useState<TrackId>(initial)
  return <TracksSection activeId={activeId} onSelect={setActiveId} />
}

function dossier() {
  return screen.getByRole('tabpanel')
}

function transitionEnd(propertyName: string) {
  const event = new Event('transitionend', { bubbles: true })
  Object.defineProperty(event, 'propertyName', { value: propertyName })
  dossier().dispatchEvent(event)
}

function animationEnd(animationName: string) {
  const event = new Event('animationend', { bubbles: true })
  Object.defineProperty(event, 'animationName', { value: animationName })
  dossier().dispatchEvent(event)
}

async function finishTransition() {
  await act(async () => {
    transitionEnd('transform')
  })
  await act(async () => {
    animationEnd('dossier-swap-in')
  })
}

describe('Tracks 状态机与可访问交互', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('单次切换依次经过 exiting、entering 并最终稳定', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    expect(dossier()).toHaveClass('is-exiting')

    await act(async () => {
      transitionEnd('transform')
    })
    expect(dossier()).toHaveClass('is-entering')
    expect(dossier()).toHaveTextContent('网络安全')

    await act(async () => {
      animationEnd('dossier-swap-in')
    })
    expect(dossier()).not.toHaveClass('is-exiting')
    expect(dossier()).not.toHaveClass('is-entering')
    expect(dossier()).toHaveTextContent('网络安全')
  })

  it('快速连续点击最终只显示最后一次选择', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '人工智能算法' }))
    fireEvent.click(screen.getByRole('tab', { name: '数据分析' }))
    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))

    await finishTransition()
    expect(dossier()).toHaveTextContent('网络安全')
    expect(dossier()).not.toHaveClass('is-exiting')
    expect(dossier()).not.toHaveClass('is-entering')
  })

  it('点击当前已选方向不会重新播放切换动画', async () => {
    render(<Harness />)
    const current = screen.getByRole('tab', { name: 'AI 全栈开发' })

    fireEvent.click(current)
    expect(dossier()).not.toHaveClass('is-exiting')
    expect(dossier()).not.toHaveClass('is-entering')

    await finishTransition()
    expect(dossier()).not.toHaveClass('is-exiting')
    expect(dossier()).not.toHaveClass('is-entering')
  })

  it('旧 timer 不会覆盖快速产生的新目标', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '人工智能算法' }))
    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))

    await finishTransition()
    expect(dossier()).toHaveTextContent('网络安全')
  })

  it('entering 阶段收到相同目标时不会提前结束动画', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    await act(async () => {
      transitionEnd('transform')
    })
    expect(dossier()).toHaveClass('is-entering')

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    expect(dossier()).toHaveClass('is-entering')

    await act(async () => {
      animationEnd('dossier-swap-in')
    })
    expect(dossier()).not.toHaveClass('is-entering')
  })

  it('只接受 dossier 自身的 transform 与 swap animation 事件', async () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    transitionEnd('opacity')
    expect(dossier()).toHaveClass('is-exiting')

    await act(async () => {
      transitionEnd('transform')
    })
    animationEnd('live-pulse')
    expect(dossier()).toHaveClass('is-entering')

    await act(async () => {
      animationEnd('dossier-swap-in')
    })
    expect(dossier()).not.toHaveClass('is-entering')
  })

  it('CSS 事件丢失时 watchdog 仍能完成切换', async () => {
    vi.useFakeTimers()
    render(<Harness />)

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    await act(async () => {
      vi.advanceTimersByTime(TRACK_EXIT_WATCHDOG_MS)
    })
    expect(dossier()).toHaveClass('is-entering')

    await act(async () => {
      vi.advanceTimersByTime(TRACK_ENTER_WATCHDOG_MS)
    })
    expect(dossier()).not.toHaveClass('is-entering')
  })

  it('卸载时清理仍存活的 exit/enter timer', () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    const { unmount } = render(<Harness />)
    const before = clearTimeoutSpy.mock.calls.length

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    unmount()

    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(before)
  })

  it('方向键循环切换并把焦点移动到新 tab', () => {
    vi.useFakeTimers()
    render(<Harness />)
    const first = screen.getByRole('tab', { name: 'AI 全栈开发' })
    first.focus()

    fireEvent.keyDown(first, { key: 'ArrowRight' })
    const second = screen.getByRole('tab', { name: '人工智能算法' })
    expect(second).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(second)

    fireEvent.keyDown(second, { key: 'ArrowLeft' })
    expect(first).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(first)

    fireEvent.keyDown(first, { key: 'ArrowLeft' })
    const last = screen.getByRole('tab', { name: '网络安全' })
    expect(last).toHaveAttribute('aria-selected', 'true')
    expect(document.activeElement).toBe(last)
  })

  it('Home 和 End 分别定位首尾方向', () => {
    render(<Harness initial="data-analysis" />)
    const middle = screen.getByRole('tab', { name: '数据分析' })
    middle.focus()

    fireEvent.keyDown(middle, { key: 'Home' })
    expect(screen.getByRole('tab', { name: 'AI 全栈开发' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(screen.getByRole('tab', { name: 'AI 全栈开发' }), { key: 'End' })
    expect(screen.getByRole('tab', { name: '网络安全' })).toHaveAttribute('aria-selected', 'true')
  })

  it('tab 与 tabpanel 的 ARIA 关系保持一致', () => {
    render(<Harness initial="ai-algorithm" />)
    const selected = screen.getByRole('tab', { name: '人工智能算法' })
    const panel = dossier()

    expect(selected).toHaveAttribute('id', 'track-tab-ai-algorithm')
    expect(selected).toHaveAttribute('aria-controls', 'track-panel-ai-algorithm')
    expect(selected).toHaveAttribute('tabindex', '0')
    expect(panel).toHaveAttribute('id', 'track-panel-ai-algorithm')
    expect(panel).toHaveAttribute('aria-labelledby', 'track-tab-ai-algorithm')
  })

  it('切换阶段会清零 dossier 的 pointer tilt', () => {
    vi.useFakeTimers()
    render(<Harness />)
    const panel = dossier()
    const frame = panel.parentElement
    expect(frame).not.toBeNull()
    vi.spyOn(frame!, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.pointerEnter(frame!)
    fireEvent.pointerMove(frame!, { clientX: 90, clientY: 10, pointerType: 'mouse' })
    expect(panel.style.getPropertyValue('--tilt-y')).not.toBe('0deg')

    fireEvent.click(screen.getByRole('tab', { name: '网络安全' }))
    expect(frame!.style.getPropertyValue('--tilt-x')).toBe('0deg')
    expect(frame!.style.getPropertyValue('--tilt-y')).toBe('0deg')
  })
})
