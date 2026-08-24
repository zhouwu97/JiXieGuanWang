import { useEffect, useRef } from 'react'
import { subscribeMotion, getPointerSnapshot, type PointerSnapshot } from './motionRuntime'
import { useReducedMotion } from './useReducedMotion'

export function usePointerMotion() {
  const reduced = useReducedMotion()
  const fine = typeof matchMedia !== 'function' || matchMedia('(pointer: fine)').matches
  const snapshotRef = useRef<PointerSnapshot>(getPointerSnapshot())

  useEffect(() => {
    if (reduced || !fine) return undefined
    return subscribeMotion((frame) => {
      snapshotRef.current = frame.pointer
      const root = document.documentElement
      root.style.setProperty('--pointer-x', `${frame.pointer.x}px`)
      root.style.setProperty('--pointer-y', `${frame.pointer.y}px`)
      root.style.setProperty('--pointer-nx', frame.pointer.normalizedX.toFixed(4))
      root.style.setProperty('--pointer-ny', frame.pointer.normalizedY.toFixed(4))
      root.style.setProperty('--pointer-speed', Math.min(1, frame.pointer.speed / 32).toFixed(3))
    })
  }, [reduced, fine])

  return snapshotRef
}
