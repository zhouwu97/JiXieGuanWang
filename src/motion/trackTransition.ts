export const TRACK_EXIT_WATCHDOG_MS = 700
export const TRACK_ENTER_WATCHDOG_MS = 700
export const TRACK_CHAPTER_HYSTERESIS = 0.015

export function getAdjacentTrackIndex(index: number, direction: -1 | 1, count: number) {
  if (count <= 0) return -1
  return (index + direction + count) % count
}

/**
 * 用迟滞锁住 chapter 边界，避免触摸板或 smooth scroll 在临界点反复切卡。
 * 采用 while 而不是单步推进，保证快速跨越多个章节时仍然 latest wins。
 */
export function resolveTrackChapter(
  progress: number,
  currentIndex: number,
  count: number,
  hysteresis = TRACK_CHAPTER_HYSTERESIS,
) {
  if (count <= 0) return -1

  const current = Math.max(0, Math.min(count - 1, Math.trunc(currentIndex)))
  const safeProgress = Math.max(0, Math.min(1, progress))
  const margin = Math.max(0, hysteresis)
  let next = current

  while (next < count - 1 && safeProgress >= (next + 1) / count + margin) next += 1
  while (next > 0 && safeProgress <= next / count - margin) next -= 1

  return next
}
