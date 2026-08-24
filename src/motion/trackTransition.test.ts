import { describe, expect, it } from 'vitest'
import { resolveTrackChapter } from './trackTransition'

describe('Tracks chapter 迟滞', () => {
  it('在 02/03 边界附近保持当前章节，跨过迟滞带后才切换', () => {
    expect(resolveTrackChapter(0.499, 1, 4)).toBe(1)
    expect(resolveTrackChapter(0.501, 1, 4)).toBe(1)
    expect(resolveTrackChapter(0.516, 1, 4)).toBe(2)
  })

  it('向上滚动需要越过反向边界后才回到上一章', () => {
    expect(resolveTrackChapter(0.501, 2, 4)).toBe(2)
    expect(resolveTrackChapter(0.484, 2, 4)).toBe(1)
  })

  it('快速跨越多个章节时仍然一次解析到最终目标', () => {
    expect(resolveTrackChapter(0.9, 0, 4)).toBe(3)
    expect(resolveTrackChapter(0.05, 3, 4)).toBe(0)
  })
})
