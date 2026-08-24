import { describe, expect, it } from 'vitest'
import { shouldAnimateRoute } from './routeMotion'

describe('Route 动画策略', () => {
  it('仅在可见、前台且非 reduced motion 时运行', () => {
    expect(shouldAnimateRoute(false, true, true)).toBe(true)
    expect(shouldAnimateRoute(false, false, true)).toBe(false)
    expect(shouldAnimateRoute(false, true, false)).toBe(false)
    expect(shouldAnimateRoute(true, true, true)).toBe(false)
  })
})
