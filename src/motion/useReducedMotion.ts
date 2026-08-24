import { useMediaQuery } from './useMediaQuery'

export function readReducedMotion() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false)
}
