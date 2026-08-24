import { describe, expect, it } from 'vitest'
import {
  calculateHeroProgress,
  clamp,
  damp,
  isHeroParallaxEnabled,
  lerp,
  mapRange,
} from './motionMath'

describe('motion math', () => {
  it('clamps and maps values without leaking outside the range', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-2, 0, 10)).toBe(0)
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50)
  })

  it('interpolates and damps toward a target', () => {
    expect(lerp(0, 10, 0.25)).toBe(2.5)
    expect(damp(0, 10, 0.5, 16)).toBeGreaterThan(0)
    expect(damp(0, 10, 0.5, 16)).toBeLessThan(10)
  })

  it('calculates Hero progress from viewport travel instead of Hero height', () => {
    expect(calculateHeroProgress(0, 1000)).toBe(0)
    expect(calculateHeroProgress(-250, 1000)).toBe(0.25)
    expect(calculateHeroProgress(-500, 1000)).toBe(0.5)
    expect(calculateHeroProgress(-1000, 1000)).toBe(1)
    expect(calculateHeroProgress(100, 1000)).toBe(0)
  })

  it('disables Hero parallax for reduced motion and mobile layouts', () => {
    expect(isHeroParallaxEnabled(false, false)).toBe(true)
    expect(isHeroParallaxEnabled(true, false)).toBe(false)
    expect(isHeroParallaxEnabled(false, true)).toBe(false)
  })
})
