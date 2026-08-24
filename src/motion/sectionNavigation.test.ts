import { describe, expect, it } from 'vitest'
import { getActiveSection } from './sectionNavigation'

describe('章节导航 active section', () => {
  const sections = [
    { id: 'home', top: -900, bottom: -20 },
    { id: 'paths', top: -20, bottom: 860 },
    { id: 'route', top: 860, bottom: 1700 },
    { id: 'join', top: 4200, bottom: 5200 },
  ]

  it('按参考线前最后一个章节选择，不依赖 IO entries 顺序', () => {
    expect(getActiveSection(sections, 120)).toBe('paths')
    expect(getActiveSection(sections, 900)).toBe('route')
    expect(getActiveSection(sections, 160)).toBe('paths')
  })

  it('快速滚动到页面底部时不会回到 home', () => {
    expect(getActiveSection(sections.map((section) => ({
      ...section,
      top: section.top - 4300,
      bottom: section.bottom - 4300,
    })), 120)).toBe('join')
  })
})
