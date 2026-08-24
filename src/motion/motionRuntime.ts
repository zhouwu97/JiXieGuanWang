import { clamp, damp, lerp } from './motionMath'

export interface PointerSnapshot {
  targetX: number
  targetY: number
  x: number
  y: number
  velocityX: number
  velocityY: number
  speed: number
  normalizedX: number
  normalizedY: number
  active: boolean
  fine: boolean
}

export interface ScrollSnapshot {
  y: number
  velocity: number
  progress: number
}

export interface MotionFrame {
  time: number
  delta: number
  pointer: PointerSnapshot
  scroll: ScrollSnapshot
}

type FrameListener = (frame: MotionFrame) => void
type PointerDownListener = (event: PointerEvent) => void

export interface MotionSubscriptionOptions {
  /** 连续动效订阅会让运行时保持 RAF；指针/滚动等响应式订阅只在唤醒后运行到状态稳定。 */
  continuous?: boolean
}

const pointer: PointerSnapshot = {
  targetX: 0,
  targetY: 0,
  x: 0,
  y: 0,
  velocityX: 0,
  velocityY: 0,
  speed: 0,
  normalizedX: 0,
  normalizedY: 0,
  active: false,
  fine: false,
}

const scroll: ScrollSnapshot = { y: 0, velocity: 0, progress: 0 }
const frameListeners = new Set<FrameListener>()
const continuousListeners = new Set<FrameListener>()
const pointerDownListeners = new Set<PointerDownListener>()
let raf = 0
let lastTime = 0
let lastPointerX = 0
let lastPointerY = 0
let lastScrollY = 0
let lastScrollTime = 0
let pointerInitialized = false
let runtimeListening = false

function hasSettlingMotion() {
  return Math.abs(pointer.targetX - pointer.x) > 0.05
    || Math.abs(pointer.targetY - pointer.y) > 0.05
    || Math.abs(pointer.velocityX) > 0.01
    || Math.abs(pointer.velocityY) > 0.01
    || Math.abs(scroll.velocity) > 0.005
}

function scheduleFrame() {
  if (!raf && frameListeners.size > 0) raf = requestAnimationFrame(frame)
}

function updateFinePointer() {
  pointer.fine = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: fine)').matches
}

function updateScroll() {
  const doc = document.documentElement
  const max = Math.max(0, doc.scrollHeight - window.innerHeight)
  scroll.y = window.scrollY
  scroll.progress = max > 0 ? clamp(scroll.y / max, 0, 1) : 0
}

function onPointerMove(event: PointerEvent) {
  if (!pointerInitialized) {
    pointer.x = event.clientX
    pointer.y = event.clientY
    lastPointerX = event.clientX
    lastPointerY = event.clientY
    pointerInitialized = true
  }
  pointer.targetX = event.clientX
  pointer.targetY = event.clientY
  pointer.active = true
  scheduleFrame()
}

function onPointerLeave() {
  pointer.active = false
  scheduleFrame()
}

function onPointerDown(event: PointerEvent) {
  pointerDownListeners.forEach((listener) => listener(event))
}

function onScroll() {
  updateScroll()
  scheduleFrame()
}

function onResize() {
  updateFinePointer()
  updateScroll()
  scheduleFrame()
}

function frame(time: number) {
  raf = 0
  const delta = lastTime ? Math.min(64, Math.max(1, time - lastTime)) : 16
  const width = Math.max(1, window.innerWidth)
  const height = Math.max(1, window.innerHeight)
  const pointerDeltaX = pointer.targetX - lastPointerX
  const pointerDeltaY = pointer.targetY - lastPointerY
  const scrollDelta = scroll.y - lastScrollY
  const scrollDeltaTime = lastScrollTime ? Math.max(16, time - lastScrollTime) : 16

  pointer.velocityX = lerp(pointer.velocityX, pointerDeltaX / delta, 0.18)
  pointer.velocityY = lerp(pointer.velocityY, pointerDeltaY / delta, 0.18)
  pointer.speed = lerp(pointer.speed, Math.hypot(pointerDeltaX, pointerDeltaY), 0.18)
  pointer.x = damp(pointer.x, pointer.targetX, 18, delta)
  pointer.y = damp(pointer.y, pointer.targetY, 18, delta)
  pointer.normalizedX = pointer.targetX / width - 0.5
  pointer.normalizedY = pointer.targetY / height - 0.5
  scroll.velocity = lerp(scroll.velocity, scrollDelta / scrollDeltaTime, 0.18)

  const snapshot: MotionFrame = {
    time,
    delta,
    pointer: { ...pointer },
    scroll: { ...scroll },
  }
  frameListeners.forEach((listener) => listener(snapshot))

  lastTime = time
  lastPointerX = pointer.targetX
  lastPointerY = pointer.targetY
  lastScrollY = scroll.y
  lastScrollTime = time

  if (continuousListeners.size > 0 || hasSettlingMotion()) scheduleFrame()
}

function ensureRuntime() {
  if (!runtimeListening) {
    runtimeListening = true
    updateFinePointer()
    updateScroll()
    lastScrollY = scroll.y
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  }
  if (continuousListeners.size > 0) scheduleFrame()
}

function releaseRuntime() {
  if (frameListeners.size + pointerDownListeners.size > 0) return
  if (!runtimeListening) return
  runtimeListening = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (raf) cancelAnimationFrame(raf)
  raf = 0
  continuousListeners.clear()
  pointer.active = false
  pointerInitialized = false
}

export function subscribeMotion(listener: FrameListener, options: MotionSubscriptionOptions = {}) {
  frameListeners.add(listener)
  if (options.continuous !== false) continuousListeners.add(listener)
  ensureRuntime()
  if (options.continuous === false) scheduleFrame()
  return () => {
    frameListeners.delete(listener)
    continuousListeners.delete(listener)
    releaseRuntime()
  }
}

export function subscribePointerDown(listener: PointerDownListener) {
  pointerDownListeners.add(listener)
  ensureRuntime()
  return () => {
    pointerDownListeners.delete(listener)
    releaseRuntime()
  }
}

export function getPointerSnapshot() {
  return { ...pointer }
}

export function getScrollSnapshot() {
  return { ...scroll }
}
