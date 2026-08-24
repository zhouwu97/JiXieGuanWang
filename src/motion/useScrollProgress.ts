import { useEffect, useRef } from 'react'
import { subscribeMotion, getScrollSnapshot, type ScrollSnapshot } from './motionRuntime'
import { clamp } from './motionMath'
import { useReducedMotion } from './useReducedMotion'

export function useScrollProgress() {
  const reduced = useReducedMotion()
  const snapshotRef = useRef<ScrollSnapshot>(getScrollSnapshot())

  useEffect(() => {
    if (reduced) {
      const snapshot = getScrollSnapshot()
      snapshot.velocity = 0
      snapshotRef.current = snapshot
      const root = document.documentElement
      root.style.setProperty('--scroll-y', `${snapshot.y}px`)
      root.style.setProperty('--scroll-progress', snapshot.progress.toFixed(4))
      root.style.setProperty('--scroll-velocity', '0')
      root.style.setProperty('--ticker-speed', '30s')
      return undefined
    }
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
