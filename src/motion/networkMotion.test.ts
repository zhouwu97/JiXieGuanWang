import { describe, expect, it } from 'vitest'
import { isNetworkPulseInteraction, shouldAnimateNetwork } from './networkMotion'

describe('Network 动画策略', () => {
  it('离屏、页面隐藏或 reduced motion 时不持续动画', () => {
    expect(shouldAnimateNetwork(false, true, true)).toBe(true)
    expect(shouldAnimateNetwork(false, false, true)).toBe(false)
    expect(shouldAnimateNetwork(false, true, false)).toBe(false)
    expect(shouldAnimateNetwork(true, true, true)).toBe(false)
  })

  it('交互控件点击不产生背景冲击波，空白区域可以产生', () => {
    const button = document.createElement('button')
    const dialogChild = document.createElement('span')
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    dialog.append(dialogChild)
    const blank = document.createElement('div')

    expect(isNetworkPulseInteraction(button)).toBe(true)
    expect(isNetworkPulseInteraction(dialogChild)).toBe(true)
    expect(isNetworkPulseInteraction(blank)).toBe(false)
    expect(isNetworkPulseInteraction(null)).toBe(false)
  })
})
