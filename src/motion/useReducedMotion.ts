import { useEffect, useState } from 'react'
import { setReducedMotion } from './motionRuntime'

export function readReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(readReducedMotion)

  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReduced(media.matches)
      setReducedMotion(media.matches)
    }
    onChange()
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}
