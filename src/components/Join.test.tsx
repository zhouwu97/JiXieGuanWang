import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JoinSection } from './Join'

describe('二维码入场凭证', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
  })

  it('可以打开全屏二维码、复制群号并通过 Escape 关闭', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    render(<JoinSection />)

    fireEvent.click(screen.getByRole('button', { name: '放大查看计算机协会招新群二维码' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'COPY' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'COPIED' })).toBeInTheDocument())
    expect(writeText).toHaveBeenCalledWith('1081018272')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('打开后把焦点限制在弹窗内，关闭后恢复触发按钮', async () => {
    render(<JoinSection />)
    const trigger = screen.getByRole('button', { name: '放大查看计算机协会招新群二维码' })
    trigger.focus()
    fireEvent.click(trigger)

    const close = document.querySelector('.qr-modal__close') as HTMLButtonElement
    const copy = screen.getByRole('button', { name: 'COPY' })
    expect(document.activeElement).toBe(close)

    copy.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    close.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(copy)

    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: '关闭二维码放大' })[0])
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('inert 背景并锁定 body 滚动，关闭后恢复', () => {
    render(<JoinSection />)
    fireEvent.click(screen.getByRole('button', { name: '放大查看计算机协会招新群二维码' }))
    const app = document.querySelector('.app') ?? document.body.firstElementChild
    expect(app?.getAttribute('aria-hidden') === 'true' || (app as HTMLElement & { inert?: boolean })?.inert || app?.hasAttribute('inert')).toBeTruthy()
    expect(document.body).toHaveClass('qr-open')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(document.body).not.toHaveClass('qr-open')
  })

  it('clipboard 不可用且 execCommand 返回 false 时不显示 COPIED', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => false) })
    render(<JoinSection />)
    fireEvent.click(screen.getByRole('button', { name: '放大查看计算机协会招新群二维码' }))
    fireEvent.click(screen.getByRole('button', { name: 'COPY' }))

    await waitFor(() => expect(screen.getByText('复制失败，请手动复制群号')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'COPY' })).toBeInTheDocument()
  })

  it('二维码加载失败时保留群号和复制入口', () => {
    render(<JoinSection />)
    fireEvent.error(screen.getByRole('img', { name: '计算机协会招新群二维码' }))
    expect(screen.getByText('二维码加载失败')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '放大查看计算机协会招新群二维码' }))
    expect(screen.getByText('可复制群号加入')).toBeInTheDocument()
    expect(screen.getAllByText('1081018272').length).toBeGreaterThan(0)
  })
})
