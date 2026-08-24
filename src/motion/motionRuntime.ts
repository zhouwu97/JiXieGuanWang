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
const pointerDownListeners = new Set<PointerDownListener>()
let raf = 0
let lastTime = 0
let lastPointerX = 0
let lastPointerY = 0
let lastScrollY = 0
let lastScrollTime = 0
let reducedMotion = false

function updateFinePointer() {
  pointer.fine = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches
}

function updateScroll() {
  const doc = document.documentElement
  const max = Math.max(0, doc.scrollHeight - window.innerHeight)
  scroll.y = window.scrollY
  scroll.progress = max > 0 ? clamp(scroll.y / max, 0, 1) : 0
}

function onPointerMove(event: PointerEvent) {
  pointer.targetX = event.clientX
  pointer.targetY = event.clientY
  pointer.active = true
}

function onPointerLeave() {
  pointer.active = false
}

function onPointerDown(event: PointerEvent) {
  pointerDownListeners.forEach((listener) => listener(event))
}

function onScroll() {
  updateScroll()
}

function onResize() {
  updateFinePointer()
  updateScroll()
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

  if (frameListeners.size > 0) raf = requestAnimationFrame(frame)
}

function ensureRuntime() {
  if (frameListeners.size + pointerDownListeners.size === 0) {
    updateFinePointer()
    updateScroll()
    lastScrollY = scroll.y
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
  }
  if (!raf && frameListeners.size > 0) raf = requestAnimationFrame(frame)
}

function releaseRuntime() {
  if (frameListeners.size + pointerDownListeners.size > 0) return
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  window.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}

export function subscribeMotion(listener: FrameListener) {
  frameListeners.add(listener)
  ensureRuntime()
  return () => {
    frameListeners.delete(listener)
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

export function setReducedMotion(value: boolean) {
  reducedMotion = value
}

export function isReducedMotion() {
  return reducedMotion
}
