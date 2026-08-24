import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { associationMeta, getTrackById, tracks } from '../data/tracks'
import { CountUp, GlitchText, LiveClock, Network, Ticker } from './common'
import { calculateHeroProgress, isHeroParallaxEnabled } from '../motion/motionMath'
import { useMotionReaction } from '../motion/useMotionReaction'
import { useMediaQuery } from '../motion/useMediaQuery'
import { useReducedMotion } from '../motion/useReducedMotion'

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
  { text: ':: 装载 04 条技术分路 · 群组 1081018272', at: 1.5 },
  { text: '[OK] 工程环境就绪 · 项目席位在线', at: 2.9 },
  { text: '[READY] 等待你的第一个 commit', at: 4.3 },
]

export function Hero({ ready }: { ready: boolean }) {
  const { name, recruitment, qqGroup } = associationMeta
  const pathCount = tracks.length
  const eventCount = tracks.reduce((sum, track) => sum + track.competitions.length, 0)
  const seatCount = getTrackById('ai-fullstack')?.projectOpportunity?.length ?? 0
  const innerRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLSpanElement>(null)
  const heroRunRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const sideRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const [glitching, setGlitching] = useState(false)
  const glitchBusy = useRef(false)
  const glitchEndTimer = useRef<number | null>(null)
  const reduced = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 760px)', false)
  const coarse = useMediaQuery('(pointer: coarse)', false)
  const [heroVisible, setHeroVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )

  useEffect(() => {
    const hero = heroRef.current
    if (!hero || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => setHeroVisible(entries[0]?.isIntersecting ?? false),
      { rootMargin: '120px 0px' },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  const triggerGlitch = useCallback(() => {
    if (reduced || glitchBusy.current || document.visibilityState === 'hidden') return
    glitchBusy.current = true
    setGlitching(true)
    glitchEndTimer.current = window.setTimeout(() => {
      glitchBusy.current = false
      setGlitching(false)
    }, 500)
  }, [reduced])

  useEffect(() => {
    if (reduced) return undefined
    const triggerWhenVisible = () => {
      if (document.visibilityState === 'visible') triggerGlitch()
    }
    const first = window.setTimeout(triggerWhenVisible, 1000)
    let timer = 0
    const schedule = () => {
      timer = window.setTimeout(() => {
        const rect = heroRef.current?.getBoundingClientRect()
        if (document.visibilityState === 'visible' && rect && rect.bottom > 0 && rect.top < window.innerHeight) triggerGlitch()
        schedule()
      }, 4500 + Math.random() * 2500)
    }
    schedule()
    return () => {
      window.clearTimeout(first)
      window.clearTimeout(timer)
      if (glitchEndTimer.current !== null) window.clearTimeout(glitchEndTimer.current)
    }
  }, [reduced, triggerGlitch])

  useMotionReaction(
    () => {
      if (reduced) return
      const heroRun = heroRunRef.current
      const hero = heroRef.current
      if (!heroRun || !hero) return
      const rect = heroRun.getBoundingClientRect()
      const travel = heroRun.offsetHeight - window.innerHeight
      const progress = calculateHeroProgress(rect.top, travel)
      if (innerRef.current) innerRef.current.style.opacity = (1 - progress * 0.78).toFixed(3)
      if (copyRef.current) copyRef.current.style.transform = `translate3d(${-progress * 34}px, ${-progress * 72}px, 0) scale(${1 - progress * 0.025})`
      if (sideRef.current) sideRef.current.style.transform = `translate3d(${progress * 46}px, ${-progress * 34}px, 0) scale(${1 + progress * 0.035})`
      if (terminalRef.current) terminalRef.current.style.transform = `perspective(1000px) rotateY(${-progress * 4}deg) rotateX(${progress * 2}deg)`
      if (ghostRef.current) ghostRef.current.style.transform = `translate3d(${-progress * 120}px, ${progress * 20}px, 0)`
    },
    ready && isHeroParallaxEnabled(reduced, mobile || coarse) && heroVisible && pageVisible,
  )

  useEffect(() => {
    if (ready && isHeroParallaxEnabled(reduced, mobile || coarse) && heroVisible && pageVisible) return undefined
    if (innerRef.current) innerRef.current.style.opacity = ''
    if (copyRef.current) copyRef.current.style.transform = ''
    if (sideRef.current) sideRef.current.style.transform = ''
    if (terminalRef.current) terminalRef.current.style.transform = ''
    if (ghostRef.current) ghostRef.current.style.transform = ''
    return undefined
  }, [ready, reduced, mobile, coarse, heroVisible, pageVisible])

  return (
    <section id="home" ref={heroRunRef} className="hero-run">
      <div ref={heroRef} className={`hero${ready ? ' is-ready' : ''}`}>
        <Network label="信号网络可视化" />
        <div className="hero-inner" ref={innerRef}>
        <div className="hero-copy" ref={copyRef}>
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
              <GlitchText text="计算机协会" active={glitching} onPointerEnter={triggerGlitch} />
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

        <div className="hero-side" ref={sideRef}>
          <div className="terminal" ref={terminalRef} aria-label="招新协议终端">
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
                  <span className="typed">
                    {line.text}
                  </span>
                </p>
              ))}
              <div className="term-footer">
                <p className="term-caret" aria-hidden="true">
                  ▊
                </p>
                <div className="signal-bars" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
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
          SYIT-CA.026
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
      </div>
    </section>
  )
}
