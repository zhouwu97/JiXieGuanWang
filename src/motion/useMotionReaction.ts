import { useEffect, useRef } from 'react'
import { subscribeMotion, type MotionFrame } from './motionRuntime'

/**
 * 只在指针/滚动状态变化时响应的动效订阅。
 * 与长驻 RAF 不同，页面静止后运行时会自动休眠。
 */
export function useMotionReaction(
  callback: (frame: MotionFrame) => void,
  enabled = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return undefined
    return subscribeMotion((frame) => callbackRef.current(frame), { continuous: false })
  }, [enabled])
}
