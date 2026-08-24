import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

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

export function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch" data-glitch={text}>
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
  const [value, setValue] = useState('00')

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const finish = () => setValue(String(to).padStart(2, '0'))
    if (
      typeof IntersectionObserver === 'undefined' ||
      (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches)
    ) {
      finish()
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started.current) return
          started.current = true
          observer.disconnect()
          const begin = performance.now()
          const tick = (now: number) => {
            const progress = Math.min(1, (now - begin) / (duration * 1000))
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(String(Math.round(to * eased)).padStart(2, '0'))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }),
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [to, duration])

  return <span ref={ref}>{value}</span>
}

interface NetworkNode {
  x: number
  y: number
  phase: number
  size: number
  amber: boolean
}

export function Network({ label = '信号网络可视化' }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0.6, y: 0.4, active: false })

  const setPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerRef.current = {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
      active: true,
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) return
    const context = canvas.getContext('2d')
    const host = canvas.parentElement
    if (!context || !host) return

    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let frame = 0
    let nodes: NetworkNode[] = []

    const seed = () => {
      const count = Math.max(48, Math.floor((width * height) / 13000))
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        phase: (index * 0.71) % (Math.PI * 2),
        size: 1.6 + Math.random() * 2.2,
        amber: index % 13 === 0,
      }))
    }

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(320, bounds.width)
      height = Math.max(320, bounds.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      const pointer = pointerRef.current
      const px = pointer.x * width
      const py = pointer.y * height

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i]
        const x = node.x * width + Math.sin(time * 0.00022 + node.phase) * 5
        const y = node.y * height + Math.cos(time * 0.00019 + node.phase) * 5
        const influence = pointer.active
          ? Math.max(0, 1 - Math.hypot(x - px, y - py) / 190)
          : 0

        for (let j = i + 1; j < nodes.length; j += 1) {
          const other = nodes[j]
          const x2 = other.x * width + Math.sin(time * 0.00022 + other.phase) * 5
          const y2 = other.y * height + Math.cos(time * 0.00019 + other.phase) * 5
          const distance = Math.hypot(x - x2, y - y2)
          if (distance < 92) {
            context.strokeStyle = `rgba(38, 34, 26, ${((1 - distance / 92) * 0.13 + influence * 0.12).toFixed(3)})`
            context.lineWidth = 0.6
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(x2, y2)
            context.stroke()
          }
        }

        context.save()
        context.translate(x, y)
        context.rotate(Math.PI / 4)
        const radius = node.size + influence * 2.2
        context.fillStyle = node.amber ? '#D9702E' : '#4A4436'
        context.globalAlpha = node.amber ? 0.9 : Math.min(0.8, 0.42 + influence * 0.5)
        context.fillRect(-radius, -radius, radius * 2, radius * 2)
        context.restore()
      }

      const cx = width * 0.8
      const cy = height * 0.28
      const pulse = (Math.sin(time * 0.0005) + 1) / 2
      context.strokeStyle = 'rgba(38, 34, 26, 0.10)'
      context.lineWidth = 1
      diamond(cx, cy, 86 + pulse * 24)
      context.save()
      context.translate(cx, cy)
      context.rotate(time * 0.00009)
      context.strokeStyle = 'rgba(217, 112, 46, 0.18)'
      diamond(0, 0, 58)
      context.rotate(-time * 0.00018)
      context.strokeStyle = 'rgba(38, 34, 26, 0.09)'
      diamond(0, 0, 76)
      context.restore()
    }

    resize()
    const observer = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
    observer?.observe(host)

    if (reduced) {
      render(0)
    } else {
      const loop = (time: number) => {
        render(time)
        frame = requestAnimationFrame(loop)
      }
      frame = requestAnimationFrame(loop)
    }

    return () => {
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="network-canvas"
      aria-label={label}
      onPointerMove={setPointer}
      onPointerDown={setPointer}
      onPointerLeave={() => {
        pointerRef.current.active = false
      }}
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
