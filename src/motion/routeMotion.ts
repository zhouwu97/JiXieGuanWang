export function shouldAnimateRoute(reducedMotion: boolean, visible: boolean, pageVisible: boolean) {
  return !reducedMotion && visible && pageVisible
}
