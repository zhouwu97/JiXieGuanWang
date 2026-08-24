export const TRACK_EXIT_MS = 220
export const TRACK_ENTER_MS = 230

export function getAdjacentTrackIndex(index: number, direction: -1 | 1, count: number) {
  if (count <= 0) return -1
  return (index + direction + count) % count
}
