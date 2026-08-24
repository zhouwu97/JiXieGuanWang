import { useEffect, useState } from 'react'

function readMediaQuery(query: string, fallback: boolean) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return fallback
  return window.matchMedia(query).matches
}

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(() => readMediaQuery(query, fallback))

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    }
    const legacyMedia = media as MediaQueryList & {
      addListener?: (listener: () => void) => void
      removeListener?: (listener: () => void) => void
    }
    legacyMedia.addListener?.(onChange)
    return () => legacyMedia.removeListener?.(onChange)
  }, [query])

  return matches
}
