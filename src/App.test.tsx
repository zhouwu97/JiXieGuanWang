import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('招新官网核心交互', () => {
  it('提供锚点导航与协会标题', () => {
    render(<App />)

    const nav = within(screen.getByRole('navigation', { name: '主导航' }))
    expect(nav.getByRole('link', { name: /首页/ })).toHaveAttribute('href', '#home')
    expect(nav.getByRole('link', { name: /技术方向/ })).toHaveAttribute('href', '#paths')
    expect(nav.getByRole('link', { name: /加入协会/ })).toHaveAttribute('href', '#join')
    expect(screen.getByRole('heading', { name: /沈阳理工大学计算机协会/ })).toBeInTheDocument()
  })

  it('切换方向档案并展示限专业资格信息', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'AI 全栈开发' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /网络安全/ }))

    expect(screen.getByRole('heading', { name: '网络安全' })).toBeInTheDocument()
    expect(screen.getByText('仅限计算机、电子信息相关专业')).toBeInTheDocument()
    expect(screen.getByText('Yakit')).toBeInTheDocument()
  })

  it('展示信号可视化画布与招新群二维码', () => {
    render(<App />)

    expect(screen.getByLabelText('信号网络可视化')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /计算机协会招新群二维码/ }).getAttribute('src')).toContain(
      'assets/qq-group.jpg',
    )
    expect(screen.getAllByText('1081018272').length).toBeGreaterThan(0)
  })
})