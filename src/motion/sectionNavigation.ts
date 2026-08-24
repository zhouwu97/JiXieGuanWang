export interface SectionPosition {
  id: string
  top: number
  bottom: number
}

/** 以固定顶栏下方的参考线选取当前章节，避免依赖 IO 回调顺序。 */
export function getActiveSection(positions: readonly SectionPosition[], referenceY: number) {
  if (positions.length === 0) return ''

  let active = positions[0].id
  positions.forEach((position) => {
    if (position.top <= referenceY) active = position.id
  })
  return active
}
