import { useEffect, useRef, type CSSProperties } from 'react'
import { associationMeta, getTrackById, tracks } from '../data/tracks'
import { CountUp, GlitchText, LiveClock, Network, Ticker } from './common'

const assetBase = import.meta.env.BASE_URL

const inkTicker: readonly string[] = [
  'OPEN CALL 2026',
  'SYIT COMPUTER SOCIETY',
  '让第一行代码点亮校园',
  'RECRUITMENT ACTIVATED',
  'SHENYANG LIGONG UNIVERSITY',
  '四线并进 · 唯缺你一人',
]

const amberTicker: readonly string[] = [
  'AI 全栈开发',
  '人工智能算法',
  '数据分析',
  '网络安全',
  'QQ 1081018272',
  'SCAN TO CONNECT',
]

const termLines: readonly { text: string; at: number; cmd?: boolean }[] = [
  { text: 'syit recruit --class=2026', at: 0.3, cmd: true },
  { text: ':: 校准信号 → 群组 1081018272', at: 1.5 },
  { text: '[OK] 04 条技术分路全部在线', at: 2.9 },
  { text: '[READY] 等待你的第一个 commit', at: 4.3 },
]

export function Hero() {
  const { name, recruitment, qqGroup } = associationMeta
  const pathCount = tracks.length
  const eventCount = tracks.reduce((sum, track) => sum + track.competitions.length, 0)
  const seatCount = getTrackById('ai-fullstack')?.projectOpportunity?.length ?? 0
  const innerRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const viewport = window.innerHeight || 720
        const progress = Math.min(1, Math.max(0, window.scrollY / viewport))
        if (innerRef.current) {
          innerRef.current.style.opacity = (1 - progress * 0.85).toFixed(3)
          innerRef.current.style.transform = `translateY(${(-progress * 56).toFixed(1)}px)`
        }
        if (ghostRef.current) {
          ghostRef.current.style.transform = `translateX(${(-progress * 52).toFixed(1)}px)`
        }
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="home" className="hero">
      <Network label="信号网络可视化" />
      <div className="hero-inner" ref={innerRef}>
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <img
              className="hero-eyebrow__logo"
              src={`${assetBase}assets/association-logo.jpg`}
              alt=""
              aria-hidden="true"
            />
            <i className="live-dot" aria-hidden="true" />
            OPEN CALL / {recruitment}
            <span className="hero-eyebrow__dim">// SHENYANG</span>
          </p>
          <h2 className="hero-series">{name}</h2>
          <h1>
            <span className="hero-top">SHENYANG LIGONG UNIVERSITY</span>
            <span className="hero-cn">
              <GlitchText text="计算机协会" />
            </span>
            <span className="hero-en" aria-hidden="true">
              COMPUTER SOCIETY
            </span>
          </h1>
          <span className="hero-rule" aria-hidden="true" />
          <p className="hero-lead">
            从一个想法，到一次真实发布。
            <br />
            我们寻找下一批构建者 —— 不需要你已经很强，只需要你开始。
          </p>
          <div className="hero-actions">
            <a className="btn btn--ink" href="#paths">
              探索技术分路 <span aria-hidden="true">▸</span>
            </a>
            <a className="btn btn--line" href="#join">
              获取入场凭证 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-side">
          <div className="terminal" aria-label="招新协议终端">
            <div className="terminal__bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>syit://recruit/entry</span>
            </div>
            <div className="terminal__body">
              {termLines.map((line, index) => (
                <p
                  key={`${line.text}-${index}`}
                  className={`term-line${line.cmd ? ' term-line--cmd' : ''}`}
                  style={
                    {
                      '--typed-delay': `${line.at}s`,
                      '--typed-step': line.text.length,
                      '--typed-time': `${Math.min(1.2, line.text.length * 0.03).toFixed(2)}s`,
                    } as CSSProperties
                  }
                >
                  <span className="typed" aria-hidden="true">
                    {line.text}
                  </span>
                </p>
              ))}
              <p className="term-caret" aria-hidden="true">
                ▊
              </p>
            </div>
          </div>

          <dl className="hero-stats">
            <div>
              <dt>技术分路 / PATHS</dt>
              <dd>
                <CountUp to={pathCount} />
                <small>开放</small>
              </dd>
            </div>
            <div>
              <dt>对接赛事 / EVENTS</dt>
              <dd>
                <CountUp to={eventCount} />
                <small>场次</small>
              </dd>
            </div>
            <div>
              <dt>项目席位 / SEATS</dt>
              <dd>
                <CountUp to={seatCount} />
                <small>名额</small>
              </dd>
            </div>
          </dl>

          <p className="hero-meta">
            QQ GROUP <strong>{qqGroup}</strong>
          </p>
        </div>
      </div>

      <span className="ghost-word" ref={ghostRef} aria-hidden="true">
        SYIT
      </span>
      <span className="hero-corner hero-corner--tl" aria-hidden="true">
        SYIT-CS.026
      </span>
      <span className="hero-corner hero-corner--br" aria-hidden="true">
        <LiveClock />· SYS.READY_ 2026
      </span>
      <div className="scroll-cue" aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>

      <div className="hero-tickers">
        <Ticker items={inkTicker} variant="ink" />
        <Ticker items={amberTicker} variant="amber" reverse />
      </div>
    </section>
  )
}
