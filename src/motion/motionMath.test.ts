import { describe, expect, it } from 'vitest'
import { clamp, damp, lerp, mapRange } from './motionMath'

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
})
