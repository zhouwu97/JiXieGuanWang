import { useEffect, useRef } from 'react'
import { subscribeMotion, getScrollSnapshot, type ScrollSnapshot } from './motionRuntime'
import { clamp } from './motionMath'
import { useReducedMotion } from './useReducedMotion'

export function useScrollProgress() {
  const reduced = useReducedMotion()
  const snapshotRef = useRef<ScrollSnapshot>(getScrollSnapshot())

  useEffect(() => {
    return subscribeMotion((frame) => {
      snapshotRef.current = frame.scroll
      const root = document.documentElement
      root.style.setProperty('--scroll-y', `${frame.scroll.y}px`)
      root.style.setProperty('--scroll-progress', frame.scroll.progress.toFixed(4))
      root.style.setProperty('--scroll-velocity', frame.scroll.velocity.toFixed(4))
      root.style.setProperty('--ticker-speed', `${clamp(30 - Math.abs(frame.scroll.velocity) * 40, 20, 32).toFixed(2)}s`)
    })
  }, [reduced])

  return snapshotRef
}
