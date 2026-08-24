import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { JoinSection } from './Join'

describe('二维码入场凭证', () => {
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
})
