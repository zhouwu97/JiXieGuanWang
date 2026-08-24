import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import {
  associationMeta,
  getTrackById,
  recruitmentNotes,
  tracks,
  type TrackDefinition,
  type TrackId,
} from './data/tracks'
import './styles.css'

const navItems = [
  { id: 'home', label: '首页' },
  { id: 'tracks', label: '技术方向' },
  { id: 'projects', label: '项目机会' },
  { id: 'briefing', label: '招新说明' },
  { id: 'join', label: '加入协会' },
] as const

const assetBase = import.meta.env.BASE_URL

function SignalCanvas({ accent }: { accent: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerRef = useRef({ x: 0.62, y: 0.38, active: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // jsdom 没有实现 Canvas 2D 上下文，测试中保留可访问的画布节点即可。
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom')) return
    const context = canvas.getContext('2d')
    if (!context) return

    const host = canvas.parentElement
    if (!host) return
    let frame = 0
    let width = 0
    let height = 0
    let dpr = 1
    let nodes: Array<{ x: number; y: number; phase: number; size: number }> = []

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      width = Math.max(320, bounds.width)
      height = Math.max(360, bounds.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(78, Math.floor((width * height) / 8000))
      nodes = Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        phase: (index * 0.87) % (Math.PI * 2),
        size: 1.1 + Math.random() * 1.8,
      }))
    }

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      context.fillStyle = 'rgba(8, 12, 18, 0.32)'
      context.fillRect(0, 0, width, height)
      const pointer = pointerRef.current
      const px = pointer.x * width
      const py = pointer.y * height

      for (let i = 0; i < nodes.length; i += 1) {
        const first = nodes[i]
        const x = first.x * width + Math.sin(time * 0.00024 + first.phase) * 7
        const y = first.y * height + Math.cos(time * 0.00021 + first.phase) * 7
        const pointerDistance = Math.hypot(x - px, y - py)
        const influence = pointer.active ? Math.max(0, 1 - pointerDistance / 210) : 0
        const pulse = 0.5 + Math.sin(time * 0.0012 + first.phase) * 0.22 + influence * 0.32

        for (let j = i + 1; j < nodes.length; j += 1) {
          const second = nodes[j]
          const x2 = second.x * width + Math.sin(time * 0.00024 + second.phase) * 7
          const y2 = second.y * height + Math.cos(time * 0.00021 + second.phase) * 7
          const distance = Math.hypot(x - x2, y - y2)
          if (distance < 112) {
            const opacity = (1 - distance / 112) * 0.18 + influence * 0.1
            context.strokeStyle = `rgba(112, 169, 184, ${opacity.toFixed(3)})`
            context.lineWidth = 0.6
            context.beginPath()
            context.moveTo(x, y)
            context.lineTo(x2, y2)
            context.stroke()
          }
        }

        context.fillStyle = accent
        context.globalAlpha = Math.min(0.92, pulse)
        context.beginPath()
        context.arc(x, y, first.size + influence * 1.6, 0, Math.PI * 2)
        context.fill()
        context.globalAlpha = 1
      }

      context.strokeStyle = 'rgba(255,255,255,0.08)'
      context.lineWidth = 1
      const scanY = ((time * 0.042) % (height + 80)) - 40
      context.beginPath()
      context.moveTo(0, scanY)
      context.lineTo(width, scanY)
      context.stroke()
      frame = window.requestAnimationFrame(draw)
    }

    resize()
    const observer = 'ResizeObserver' in window ? new ResizeObserver(resize) : null
    observer?.observe(host)
    frame = window.requestAnimationFrame(draw)
    return () => {
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
    }
  }, [accent])

  const setPointer = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerRef.current = {
      x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
      active: true,
    }
  }

  return (
    <canvas
      ref={canvasRef}
      className="signal-canvas"
      aria-label="实时算法信号可视化"
      onPointerMove={setPointer}
      onPointerDown={setPointer}
      onPointerLeave={() => {
        pointerRef.current.active = false
      }}
    />
  )
}

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark${compact ? ' brand-mark--compact' : ''}`} aria-hidden="true">
      <span className="brand-mark__left">C</span>
      <span className="brand-mark__right">S</span>
      <span className="brand-mark__tail" />
    </span>
  )
}

function Header({ activeSection }: { activeSection: string }) {
  return (
    <header className="site-header">
      <a className="header-brand" href="#home" aria-label="返回首页">
        <img className="header-logo" src={`${assetBase}assets/association-logo.jpg`} alt="沈阳理工大学计算机协会标志" />
        <span className="header-brand__text">
          <strong>SYIT / CS</strong>
          <small>COMPUTER ASSOCIATION</small>
        </span>
      </a>
      <nav aria-label="主导航" className="main-nav">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-label={item.label}
            className={activeSection === item.id ? 'is-active' : ''}
          >
            <span className="nav-index">0{navItems.indexOf(item) + 1}</span>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#join">
        <span>加入系统</span>
        <span className="arrow-glyph" aria-hidden="true">↗</span>
      </a>
    </header>
  )
}

function SectionTag({ children, number }: { children: string; number: string }) {
  return (
    <div className="section-tag">
      <span>{number}</span>
      <span>{children}</span>
      <i aria-hidden="true" />
    </div>
  )
}

function Hero() {
  const { name, recruitment } = associationMeta
  return (
    <section id="home" className="hero section-shell">
      <SignalCanvas accent="#32d1ee" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-main">
        <div className="eyebrow"><span className="status-dot" /> OPEN CALL / {recruitment.replace(' 招新', '')}</div>
        <h2 className="hero-association-title">{name}</h2>
        <h1>
          <span>让代码</span>
          <span className="hero-title-accent">成为你的</span>
          <span>第二语言</span>
        </h1>
        <p className="hero-lead">
          沈阳理工大学计算机协会，正在寻找下一批构建者。<br />
          从一个想法开始，把它部署到真实世界。
        </p>
        <div className="hero-actions">
          <a className="button button--primary" href="#tracks">
            探索技术方向 <span aria-hidden="true">↓</span>
          </a>
          <a className="button button--ghost" href="#join">
            获取入场凭证 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="hero-aside">
        <div className="hero-emblem"><Mark /><span>CS</span></div>
        <div className="hero-meta">
          <div><span>当前状态</span><strong><i className="status-dot" /> 招新开放中</strong></div>
          <div><span>组织编号</span><strong>SYIT-CS / 26</strong></div>
          <div><span>集结坐标</span><strong>沈阳理工大学</strong></div>
        </div>
        <div className="hero-aside-foot">
          <span>SCROLL TO INITIALIZE</span>
          <span className="scroll-line" aria-hidden="true" />
        </div>
      </div>
      <div className="hero-corner hero-corner--tl" aria-hidden="true">▧ 001 / 256</div>
      <div className="hero-corner hero-corner--br" aria-hidden="true">SYS.READY</div>
    </section>
  )
}

function TrackSelector({ activeId, onSelect }: { activeId: TrackId; onSelect: (id: TrackId) => void }) {
  return (
    <div className="track-selector" role="tablist" aria-label="技术方向选择">
      {tracks.map((track) => (
        <button
          key={track.id}
          type="button"
          role="tab"
          aria-label={track.name}
          aria-selected={activeId === track.id}
          className={activeId === track.id ? 'track-tab is-active' : 'track-tab'}
          style={{ '--tab-accent': track.accent } as CSSProperties}
          onClick={() => onSelect(track.id)}
        >
          <span className="track-tab__index">0{track.index}</span>
          <span className="track-tab__name">{track.shortName}</span>
          <span className="track-tab__signal" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

function TrackArchive({ track }: { track: TrackDefinition }) {
  return (
    <div className="track-archive" style={{ '--track-accent': track.accent } as CSSProperties}>
      <div className="archive-heading">
        <div>
          <span className="archive-code">PROFILE / 0{track.index}</span>
          <h3>{track.name}</h3>
        </div>
        <span className="archive-status">ACTIVE <i className="status-dot" /></span>
      </div>
      <p className="archive-summary">{track.summary}</p>
      <div className="archive-grid">
        <div className="archive-field">
          <span>招募范围</span>
          <strong>{track.eligibility}</strong>
        </div>
        <div className="archive-field">
          <span>设备需求</span>
          <strong>{track.hardware}</strong>
        </div>
      </div>
      <div className="module-block">
        <span className="block-label">学习模块 / MODULES</span>
        <div className="module-list">
          {track.modules.map((module) => <span key={module}>{module}</span>)}
        </div>
      </div>
      <div className="competition-block">
        <span className="block-label">赛事接入 / COMPETITIONS</span>
        <ul>
          {track.competitions.map((competition) => <li key={competition}>{competition}</li>)}
        </ul>
      </div>
    </div>
  )
}

function TracksSection({ activeId, onSelect }: { activeId: TrackId; onSelect: (id: TrackId) => void }) {
  const activeTrack = getTrackById(activeId) ?? tracks[0]
  return (
    <section id="tracks" className="tracks-section section-shell">
      <div className="section-inner">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="01" >TECHNICAL PATHS</SectionTag>
            <h2>选择你的<br /><em>运算方向</em></h2>
          </div>
          <p>四条路径，四种解题方式。<br />你可以从兴趣出发，也可以从问题出发。</p>
        </div>
        <div className="track-layout">
          <TrackSelector activeId={activeId} onSelect={onSelect} />
          <TrackArchive track={activeTrack} />
        </div>
      </div>
    </section>
  )
}

function ProjectSection() {
  const fullstack = getTrackById('ai-fullstack')
  return (
    <section id="projects" className="project-section section-shell">
      <div className="project-beam" aria-hidden="true" />
      <div className="section-inner project-inner">
        <div className="section-heading">
          <SectionTag number="02">PROJECT OPPORTUNITY</SectionTag>
          <h2>把练习场<br /><em>连接到现实</em></h2>
        </div>
        <div className="project-content">
          <div className="project-intro">
            <span className="project-kicker">FIELD PROJECT / CAMPUS LIVE</span>
            <p>真正的项目不会等待你准备好。我们用真实需求、真实协作和真实发布，给每个认真写代码的人一张通往现场的票。</p>
            <a className="text-link" href="#join">查看入场方式 <span aria-hidden="true">↗</span></a>
          </div>
          <div className="project-timeline">
            <div className="timeline-line" aria-hidden="true" />
            {fullstack?.projectOpportunity?.map((opportunity, index) => (
              <div className="timeline-step" key={opportunity}>
                <span className="timeline-node">0{index + 1}</span>
                <div><span className="timeline-label">{index === 0 ? '第一学期末' : '第二学期'}</span><strong>{opportunity.replace(/^第一学期末|^第二学期/, '')}</strong></div>
              </div>
            ))}
            <div className="timeline-step timeline-step--future">
              <span className="timeline-node">∞</span>
              <div><span className="timeline-label">持续发生</span><strong>根据项目进展，开放更多席位</strong></div>
            </div>
          </div>
        </div>
        <div className="code-strip" aria-label="协会工程能力示例">
          <span className="code-strip__prompt">$</span>
          <span className="code-strip__command">build --ship --learn</span>
          <span className="code-strip__cursor" aria-hidden="true" />
          <span className="code-strip__result">compiled in 0.026s</span>
        </div>
      </div>
    </section>
  )
}

function BriefingSection() {
  return (
    <section id="briefing" className="briefing-section section-shell">
      <div className="section-inner">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="03">RECRUITMENT BRIEFING</SectionTag>
            <h2>入场之前<br /><em>请先读取</em></h2>
          </div>
          <p>这不是一场短暂的围观。<br />请带着你的兴趣与时间来。</p>
        </div>
        <div className="briefing-grid">
          <div className="briefing-main">
            <div className="briefing-alert"><span className="alert-mark">!</span><span>重要说明 / READ BEFORE JOINING</span></div>
            <div className="notes-list">
              {recruitmentNotes.map((note, index) => (
                <div className="note-row" key={note}><span>0{index + 1}</span><p>{note}</p><i aria-hidden="true">↗</i></div>
              ))}
            </div>
          </div>
          <aside className="briefing-side">
            <span className="block-label">MEMBERSHIP STATUS</span>
            <div className="status-readout"><i className="status-dot" /><strong>实习成员</strong><span>可提前参与对应方向学习活动</span></div>
            <div className="status-readout"><i className="status-dot status-dot--muted" /><strong>正式成员</strong><span>开学招新结束后统一确认方向</span></div>
            <div className="briefing-seal" aria-hidden="true"><span>CS</span><small>SYIT / 2026</small></div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function JoinSection() {
  const { recruitment } = associationMeta
  return (
    <section id="join" className="join-section section-shell">
      <div className="join-grid" aria-hidden="true" />
      <div className="section-inner join-inner">
        <div className="join-copy">
          <SectionTag number="04">JOIN THE ASSOCIATION</SectionTag>
          <h2>准备好<br /><em>写下下一行了吗？</em></h2>
          <p>扫描二维码加入 {recruitment}群。<br />我们在群里等你发出第一条消息。</p>
          <div className="join-meta"><span>QQ GROUP</span><strong>{associationMeta.qqGroup}</strong></div>
        </div>
        <div className="qr-frame">
          <div className="qr-corner qr-corner--tl" aria-hidden="true" /><div className="qr-corner qr-corner--br" aria-hidden="true" />
          <img src={`${assetBase}assets/qq-group.jpg`} alt="计算机协会招新群二维码" />
          <span className="qr-caption">SCAN TO CONNECT / 2026</span>
        </div>
      </div>
      <footer className="site-footer section-inner"><span>SYIT COMPUTER ASSOCIATION</span><span>沈阳理工大学 · 2026</span><span>END OF TRANSMISSION_</span></footer>
    </section>
  )
}

function App() {
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('ai-fullstack')
  const [activeSection, setActiveSection] = useState('home')
  const activeTrack = useMemo(() => getTrackById(activeTrackId) ?? tracks[0], [activeTrackId])

  useEffect(() => {
    const sections = navItems.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: '-38% 0px -52% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="app" style={{ '--active-accent': activeTrack.accent } as CSSProperties}>
      <Header activeSection={activeSection} />
      <main>
        <Hero />
        <TracksSection activeId={activeTrackId} onSelect={setActiveTrackId} />
        <ProjectSection />
        <BriefingSection />
        <JoinSection />
      </main>
    </div>
  )
}

export default App
