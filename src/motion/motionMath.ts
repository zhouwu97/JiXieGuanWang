export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

export function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
) {
  if (inputMin === inputMax) return outputMin
  return outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
}

/** 帧率无关的阻尼插值，frameMs 使用上一帧到当前帧的毫秒数。 */
export function damp(from: number, to: number, smoothing: number, frameMs: number) {
  const amount = 1 - Math.exp(-Math.max(0, smoothing) * Math.max(0, frameMs) / 1000)
  return lerp(from, to, amount)
}
