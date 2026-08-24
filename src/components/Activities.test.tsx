import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActivitiesSection } from './Activities'

describe('活动相册', () => {
  it('点击下一张时同步更新标题和当前指示器', () => {
    render(<ActivitiesSection />)
    const before = screen.getByRole('heading', { level: 3 }).textContent
    fireEvent.click(screen.getByRole('button', { name: '下一张照片' }))

    expect(screen.getByRole('heading', { level: 3 }).textContent).not.toBe(before)
    expect(screen.getByRole('button', { name: /第 2 张/ })).toHaveAttribute('aria-pressed', 'true')
  })
})
