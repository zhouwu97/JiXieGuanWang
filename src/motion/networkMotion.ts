export function shouldAnimateNetwork(reducedMotion: boolean, visible: boolean, pageVisible: boolean) {
  return !reducedMotion && visible && pageVisible
}

export function isNetworkPulseInteraction(target: EventTarget | null) {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false
  return Boolean(target.closest('a,button,input,textarea,select,[role="button"],[role="dialog"]'))
}
