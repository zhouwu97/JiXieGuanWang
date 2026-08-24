import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('招新官网关键交互', () => {
  it('提供分屏锚点导航与加入协会入口', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: '首页' })).toHaveAttribute(
      'href',
      '#home',
    )
    expect(screen.getByRole('link', { name: '技术方向' })).toHaveAttribute(
      'href',
      '#tracks',
    )
    expect(screen.getByRole('link', { name: '加入协会' })).toHaveAttribute(
      'href',
      '#join',
    )
    expect(screen.getByRole('heading', { name: /沈阳理工大学计算机协会/ })).toBeInTheDocument()
  })

  it('切换方向档案并展示对应资格信息', () => {
    render(<App />)

    expect(screen.getByText('AI 全栈开发')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /网络安全/ }))

    expect(screen.getByRole('heading', { name: '网络安全' })).toBeInTheDocument()
    expect(screen.getByText('仅限计算机、电子信息相关专业')).toBeInTheDocument()
    expect(screen.getByText('Yakit')).toBeInTheDocument()
  })

  it('首屏 Canvas 使用可访问标签，末屏展示 QQ 群二维码', () => {
    render(<App />)

    expect(screen.getByLabelText('实时算法信号可视化')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /计算机协会招新群二维码/ }).getAttribute('src')).toContain(
      'assets/qq-group.jpg',
    )
    expect(screen.getByText('1081018272')).toBeInTheDocument()
  })
})
