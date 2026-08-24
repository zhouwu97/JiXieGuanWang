import { useEffect, useRef } from 'react'
import { subscribeMotion, type MotionFrame } from './motionRuntime'

export function useRafLoop(callback: (frame: MotionFrame) => void, enabled = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return undefined
    return subscribeMotion((frame) => callbackRef.current(frame), { continuous: true })
  }, [enabled])
}
