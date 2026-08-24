import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { clamp } from '../motion/motionMath'
import { getPointerSnapshot, subscribePointerDown } from '../motion/motionRuntime'
import { isNetworkPulseInteraction, shouldAnimateNetwork } from '../motion/networkMotion'
import { useRafLoop } from '../motion/useRafLoop'
import { useMediaQuery } from '../motion/useMediaQuery'
import { useReducedMotion } from '../motion/useReducedMotion'

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return undefined
    }
    const node = ref.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setShown(true)),
      { threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal${shown ? ' is-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

export function SectionTag({ number, en, label }: { number: string; en: string; label: string }) {
  return (
    <div className="sec-tag">
      <span className="sec-tag__num">[{number}]</span>
      <span className="sec-tag__en">{en}</span>
      <span className="sec-tag__dim" aria-hidden="true">
        <i />
        <b>◆</b>
        <i />
      </span>
      <span className="sec-tag__label">{label}</span>
    </div>
  )
}

export function GlitchText({
  text,
  active = false,
  className = '',
  onPointerEnter,
}: {
  text: string
  active?: boolean
  className?: string
  onPointerEnter?: () => void
}) {
  return (
    <span
      className={`glitch${active ? ' is-glitching' : ''}${className ? ` ${className}` : ''}`}
      data-glitch={text}
      onPointerEnter={onPointerEnter}
    >
      {text}
    </span>
  )
}

export function Ticker({
  items,
  variant = 'ink',
  reverse = false,
}: {
  items: readonly string[]
  variant?: 'ink' | 'amber'
  reverse?: boolean
}) {
  const row = [...items, ...items]
  return (
    <div className={`ticker ticker--${variant}`} aria-hidden="true">
      <div className="ticker__track" style={reverse ? { animationDirection: 'reverse' } : undefined}>
        {row.map((item, index) => (
          <span className="ticker__item" key={`${item}-${index}`}>
            <i>◆</i>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CountUp({ to, duration = 1.4 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const startedAt = useRef<number | null>(null)
  const [value, setValue] = useState('00')
  const reduced = useReducedMotion()

  useRafLoop(
    ({ time }) => {
      if (startedAt.current === null) return
      const progress = Math.min(1, (time - startedAt.current) / (duration * 1000))
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(String(Math.round(to * eased)).padStart(2, '0'))
      if (progress >= 1) startedAt.current = null
    },
    !reduced,
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const finish = () => setValue(String(to).padStart(2, '0'))
    if (typeof IntersectionObserver === 'undefined' || reduced) {
      finish()
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return
          started.current = true
          observer.disconnect()
          startedAt.current = performance.now()
        }),
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [to, duration, reduced])

  return <span ref={ref}>{value}</span>
}

interface NetworkNode {
  x: number
  y: number
  homeX: number
  homeY: number
  vx: number
  vy: number
  phase: number
  size: number
  hot: boolean
  influence: number
}

export function Network({ label = '信号网络可视化' }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{ render: (time: number) => void; addPulse: (x: number, y: number) => void } | null>(null)
  const boundsRef = useRef({ left: 0, top: 0, width: 0, height: 0 })
  const reduced = useReducedMotion()
  const fine = useMediaQuery('(pointer: fine)')
  const [visible, setVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return undefined
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) return undefined
    if (typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { rootMargin: '120px 0px' },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) return
    const context = canvas.getContext('2d')
    const host = canvas.parentElement
    if (!context || !host) return

    let width = 0
    let height = 0
    let nodes: NetworkNode[] = []
    const pulses: { x: number; y: number; radius: number; alpha: number }[] = []

    const syncCanvasBounds = () => {
      const bounds = canvas.getBoundingClientRect()
      boundsRef.current = {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      }
    }

    const seed = () => {
      const count = width < 700 ? 34 : Math.min(88, Math.max(55, Math.floor((width * height) / 15000)))
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        homeX: 0,
        homeY: 0,
        vx: (Math.random() - 0.5) * 0.17,
        vy: (Math.random() - 0.5) * 0.17,
        phase: (index * 0.71) % (Math.PI * 2),
        size: 1.3 + Math.random() * 2.6,
        hot: index % 12 === 0,
        influence: 0,
      }))
      nodes.forEach((node) => {
        node.homeX = node.x
        node.homeY = node.y
      })
    }

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(320, bounds.width)
      height = Math.max(320, bounds.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      syncCanvasBounds()
      seed()
    }

    const diamond = (cx: number, cy: number, r: number) => {
      context.beginPath()
      context.moveTo(cx, cy - r)
      context.lineTo(cx + r, cy)
      context.lineTo(cx, cy + r)
      context.lineTo(cx - r, cy)
      context.closePath()
      context.stroke()
    }

    const render = (time: number) => {
      context.clearRect(0, 0, width, height)
      const pointer = getPointerSnapshot()
      const bounds = boundsRef.current
      const px = pointer.targetX - bounds.left
      const py = pointer.targetY - bounds.top

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const homeX = node.homeX + Math.sin(time * 0.00022 + node.phase) * 4
        const homeY = node.homeY + Math.cos(time * 0.00019 + node.phase) * 4
        node.vx += (homeX - node.x) * 0.000018
        node.vy += (homeY - node.y) * 0.000018
        const x = node.x
        const y = node.y
        const distance = Math.hypot(x - px, y - py)
        const influence = pointer.active && pointer.fine ? clamp(1 - distance / 285, 0, 1) : 0
        if (influence > 0) {
          const safeDistance = Math.max(distance, 18)
          const force = distance < 80 ? (1 - distance / 80) * 0.024 : -influence * 0.0028
          node.vx += ((x - px) / safeDistance) * force
          node.vy += ((y - py) / safeDistance) * force
        }
        node.vx *= 0.991
        node.vy *= 0.991
        node.x += node.vx
        node.y += node.vy
        if (node.x < 10 || node.x > width - 10) node.vx *= -0.9
        if (node.y < 10 || node.y > height - 10) node.vy *= -0.9
        node.x = clamp(node.x, 5, width - 5)
        node.y = clamp(node.y, 5, height - 5)
        node.influence = influence

        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j]
          const x2 = other.x
          const y2 = other.y
          const distance = Math.hypot(x - x2, y - y2)
          const local = Math.max(influence, other.influence)
          const limit = local > 0.08 ? 142 : 102
          if (distance < limit) {
            const alpha = (1 - distance / limit) * (0.105 + local * 0.25)
            context.strokeStyle = local > 0.38
              ? `rgba(216, 67, 31, ${(alpha * 0.72).toFixed(3)})`
              : `rgba(74, 90, 99, ${alpha.toFixed(3)})`
            context.lineWidth = 0.55 + local * 0.55
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(x2, y2)
            context.stroke()
          }
        }

        context.save()
        context.translate(x, y)
        context.rotate(Math.PI / 4)
        const radius = node.size + influence * 2.8
        context.fillStyle = node.hot || influence > 0.5 ? '#D8431F' : '#59656D'
        context.globalAlpha = node.hot ? 0.88 : clamp(0.28 + influence * 0.62, 0.28, 0.86)
        context.fillRect(-radius, -radius, radius * 2, radius * 2)
        if (influence > 0.58) {
          context.globalAlpha = (influence - 0.58) * 1.2
          context.strokeStyle = '#D8431F'
          context.lineWidth = 0.8
          context.strokeRect(-radius - 5, -radius - 5, (radius + 5) * 2, (radius + 5) * 2)
        }
        context.restore()
      }

      const cx = width * 0.8
      const cy = height * 0.28
      const pulse = (Math.sin(time * 0.0005) + 1) / 2
      context.strokeStyle = 'rgba(26, 32, 39, 0.10)'
      context.lineWidth = 1
      diamond(cx, cy, 86 + pulse * 24)
      context.save()
      context.translate(cx, cy)
      context.rotate(time * 0.00009)
      context.strokeStyle = 'rgba(216, 67, 31, 0.18)'
      diamond(0, 0, 58)
      context.rotate(-time * 0.00018)
      context.strokeStyle = 'rgba(26, 32, 39, 0.09)'
      diamond(0, 0, 76)
      context.restore()

      pulses.forEach((pulse) => {
        pulse.radius += 5.5
        pulse.alpha *= 0.948
        context.save()
        context.translate(pulse.x, pulse.y)
        context.rotate(Math.PI / 4)
        context.strokeStyle = `rgba(216, 67, 31, ${pulse.alpha})`
        context.lineWidth = 1
        context.strokeRect(-pulse.radius, -pulse.radius, pulse.radius * 2, pulse.radius * 2)
        context.restore()
      })
      pulses.splice(0, pulses.length, ...pulses.filter((pulse) => pulse.alpha > 0.035))
    }

    resize()
    const observer = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
    observer?.observe(host)
    window.addEventListener('scroll', syncCanvasBounds, { passive: true })
    window.addEventListener('resize', syncCanvasBounds, { passive: true })

    sceneRef.current = {
      render,
      addPulse: (x, y) => {
        pulses.push({ x, y, radius: 0, alpha: 0.8 })
        pulses.splice(0, Math.max(0, pulses.length - 3))
      },
    }
    render(0)

    return () => {
      sceneRef.current = null
      observer?.disconnect()
      window.removeEventListener('scroll', syncCanvasBounds)
      window.removeEventListener('resize', syncCanvasBounds)
    }
  }, [])

  useRafLoop(
    ({ time }) => sceneRef.current?.render(time),
    shouldAnimateNetwork(reduced, visible, pageVisible),
  )

  useEffect(() => {
    if (reduced || !fine) return undefined
    return subscribePointerDown((event) => {
      if (isNetworkPulseInteraction(event.target)) return
      const canvas = canvasRef.current
      if (!canvas) return
      const bounds = boundsRef.current
      const right = bounds.left + bounds.width
      const bottom = bounds.top + bounds.height
      if (event.clientX < bounds.left || event.clientX > right || event.clientY < bounds.top || event.clientY > bottom) return
      sceneRef.current?.addPulse(event.clientX - bounds.left, event.clientY - bounds.top)
    })
  }, [reduced, fine])

  return (
    <canvas
      ref={canvasRef}
      className="network-canvas"
      aria-label={label}
    />
  )
}

const bootKey = 'syit-boot-seen'

const bootLines: readonly string[] = [
  'SYIT // BOOTING',
  'LOADING WORKSPACE …',
  'LINK: RECRUITMENT · 2026',
  'READY_',
]

export function BootOverlay() {
  const [phase, setPhase] = useState<'off' | 'on' | 'done'>('off')

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(bootKey) === '1'
    } catch {
      seen = false
    }
    if (seen) return
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
        sessionStorage.setItem(bootKey, '1')
      } catch {
        /* 忽略存储异常 */
      }
      return
    }
    setPhase('on')
    const hideAt = window.setTimeout(() => setPhase('done'), 1050)
    const clearAt = window.setTimeout(() => {
      setPhase('off')
      try {
        sessionStorage.setItem(bootKey, '1')
      } catch {
        /* 忽略存储异常 */
      }
    }, 1750)
    return () => {
      window.clearTimeout(hideAt)
      window.clearTimeout(clearAt)
    }
  }, [])

  if (phase === 'off') return null

  const assetBase = import.meta.env.BASE_URL
  return (
    <div className={`boot${phase === 'done' ? ' is-done' : ''}`} aria-hidden="true">
      <div className="boot__inner">
        <img className="boot__logo" src={`${assetBase}assets/association-logo.jpg`} alt="" />
        <div className="boot__lines">
          {bootLines.map((line, index) => (
            <span className="boot__line" key={line} style={{ animationDelay: `${0.15 + index * 0.18}s` }}>
              {line}
            </span>
          ))}
        </div>
        <div className="boot__bar">
          <i />
        </div>
      </div>
    </div>
  )
}

export function LiveClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toTimeString().slice(0, 8))
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])

  return <span className="live-clock">{time}</span>
}

export function PointerGlow() {
  const reduced = useReducedMotion()
  const fine = useMediaQuery('(pointer: fine)')
  const pointerRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)
  const coordinateRef = useRef<HTMLSpanElement>(null)
  const trailRefs = useRef<HTMLSpanElement[]>([])
  const historyRef = useRef(Array.from({ length: 24 }, () => ({ x: 0, y: 0 })))
  const [pulses, setPulses] = useState<{ id: number; x: number; y: number }[]>([])
  const nextPulse = useRef(0)

  useEffect(() => {
    if (reduced || !fine) return undefined
    const onOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.('a,button,.terminal,.deploy-terminal,.dossier,.track-row,.album')
      if (!target) return
      document.body.classList.toggle('cursor-action', target.matches('a,button'))
      document.body.classList.toggle('cursor-terminal', target.matches('.terminal,.deploy-terminal'))
      document.body.classList.toggle('cursor-card', target.matches('.dossier,.track-row,.album'))
    }
    const onOut = (event: PointerEvent) => {
      if ((event.relatedTarget as HTMLElement | null)?.closest?.('a,button,.terminal,.deploy-terminal,.dossier,.track-row,.album')) return
      document.body.classList.remove('cursor-action', 'cursor-terminal', 'cursor-card')
    }
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    return () => {
      document.body.classList.remove('pointer-ready', 'cursor-action', 'cursor-terminal', 'cursor-card')
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [reduced, fine])

  useEffect(() => {
    if (reduced || !fine) return undefined
    const timers = new Set<number>()
    const unsubscribe = subscribePointerDown((event) => {
      const id = nextPulse.current++
      setPulses((current) => [...current, { id, x: event.clientX, y: event.clientY }].slice(-3))
      const timer = window.setTimeout(() => {
        setPulses((current) => current.filter((pulse) => pulse.id !== id))
        timers.delete(timer)
      }, 720)
      timers.add(timer)
    })
    return () => {
      unsubscribe()
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [reduced])

  useRafLoop(({ pointer }) => {
    if (!pointerRef.current || !reticleRef.current || !coordinateRef.current) return
    if (!pointer.active) return
    document.body.classList.add('pointer-ready')
    const pointerEl = pointerRef.current
    const reticleEl = reticleRef.current
    pointerEl.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) rotate(45deg)`
    reticleEl.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) rotate(${45 + clamp(pointer.velocityX * 0.65, -18, 18)}deg)`
    coordinateRef.current.style.transform = `translate3d(${pointer.x + 27}px, ${pointer.y + 24}px, 0)`
    coordinateRef.current.textContent = `X${String(Math.round(pointer.targetX)).padStart(4, '0')} / Y${String(Math.round(pointer.targetY)).padStart(4, '0')}`
    historyRef.current.unshift({ x: pointer.x, y: pointer.y })
    historyRef.current.length = 24
    trailRefs.current.forEach((element, index) => {
      const point = historyRef.current[Math.min(historyRef.current.length - 1, Math.round((index + 1) * 3))]
      element.style.opacity = `${Math.max(0.05, 0.35 - index * 0.05)}`
      element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) rotate(45deg) scale(${1 - index * 0.08})`
    })
  }, !reduced && fine)

  if (reduced || !fine) return null
  return (
    <>
      <div className="pointer-glow" aria-hidden="true" />
      <div className="pointer-system" aria-hidden="true">
        <i ref={pointerRef} className="pointer-system__dot" />
        <i ref={reticleRef} className="pointer-system__reticle" />
        {Array.from({ length: 7 }, (_, index) => (
          <i
            key={index}
            ref={(element) => {
              if (element) trailRefs.current[index] = element
            }}
            className="pointer-system__trail"
          />
        ))}
        <span ref={coordinateRef} className="pointer-system__coord" />
        {pulses.map((pulse) => (
          <i key={pulse.id} className="pointer-system__pulse" style={{ left: pulse.x, top: pulse.y }} />
        ))}
      </div>
    </>
  )
}
