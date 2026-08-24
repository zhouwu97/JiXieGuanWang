import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import {
  getTrackById,
  tracks,
  type TrackDefinition,
  type TrackId,
} from '../data/tracks'
import { clamp } from '../motion/motionMath'
import { useRafLoop } from '../motion/useRafLoop'
import { useReducedMotion } from '../motion/useReducedMotion'
import { GlitchText, Reveal, SectionTag } from './common'

function TrackSelector({
  activeId,
  onSelect,
  restrictedCount,
}: {
  activeId: TrackId
  onSelect: (id: TrackId) => void
  restrictedCount: number
}) {
  return (
    <div role="tablist" aria-label="技术方向选择" className="track-selector">
      {tracks.map((track) => (
        <button
          key={track.id}
          type="button"
          role="tab"
          aria-label={track.name}
          aria-selected={activeId === track.id}
          className={activeId === track.id ? 'track-row is-active' : 'track-row'}
          style={{ '--track-accent': track.accent } as CSSProperties}
          onClick={() => onSelect(track.id)}
        >
          <span className="track-row__num">{String(track.index).padStart(2, '0')}</span>
          <span className="track-row__name">{track.shortName}</span>
          <span className="track-row__en">{track.english}</span>
          <i className="track-row__sig" aria-hidden="true" />
          {track.restricted && <span className="track-row__pin" aria-label="限专业">限</span>}
        </button>
      ))}
      <p className="track-selector__note">
        SIGNALS EXPOSED
        <strong>
          {restrictedCount} / {tracks.length} 限专业
        </strong>
      </p>
    </div>
  )
}

function Dossier({ track, switching }: { track: TrackDefinition; switching: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null)

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return
    const el = frameRef.current
    if (!el) return
    const bounds = el.getBoundingClientRect()
    const dx = (event.clientX - bounds.left) / bounds.width - 0.5
    const dy = (event.clientY - bounds.top) / bounds.height - 0.5
    el.style.setProperty('--tilt-x', `${(-dy * 3.2).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(dx * 3.2).toFixed(2)}deg`)
  }

  const onPointerLeave = () => {
    const el = frameRef.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      ref={frameRef}
      className="tilt"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <article
        className={`dossier${switching ? ' is-switching' : ''}`}
        key={track.id}
        style={{ '--track-accent': track.accent } as CSSProperties}
      >
        <span className="dossier__ghost" aria-hidden="true">
          {String(track.index).padStart(2, '0')}
        </span>
        <div className="dossier__stripe" aria-hidden="true" />
        <header className="dossier__head">
          <span className="dossier__code">{track.code}</span>
          <span className="dossier__status">
            <i className="live-dot" aria-hidden="true" />
            ACTIVE
          </span>
        </header>
        <div className="dossier__title">
          <h3>{track.name}</h3>
          <p className="dossier__en">{track.english}</p>
        </div>
        <p className="dossier__summary">{track.summary}</p>

        <div className="dossier__meta">
          <div className="meta-cell">
            <span>招募范围 / ELIGIBILITY</span>
            <strong>{track.eligibility}</strong>
            {track.restricted ? (
              <em className="chip chip--restrict">
                <i>!</i> 限专业招募
              </em>
            ) : (
              <em className="chip chip--open">
                <i>✓</i> 面向全校开放
              </em>
            )}
          </div>
          <div className="meta-cell">
            <span>设备需求 / EQUIPMENT</span>
            <strong>{track.hardware}</strong>
            {track.hardware.includes('显卡') ? (
              <em className="chip chip--gpu">
                <i>◆</i> 高性能计算
              </em>
            ) : (
              <em className="chip">
                <i>◆</i> 常规设备
              </em>
            )}
          </div>
        </div>

        {track.projectOpportunity && (
          <div className="opportunity">
            <span className="dossier__label">入场名额 / OPENINGS</span>
            <ul>
              {track.projectOpportunity.map((item, index) => (
                <li key={item}>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  <i aria-hidden="true">◆</i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="dossier__block">
          <span className="dossier__label">学习模块 / MODULES</span>
          <div className="module-list">
            {track.modules.map((module) => (
              <span key={module}>{module}</span>
            ))}
          </div>
        </div>

        <div className="dossier__block">
          <span className="dossier__label">赛事接入 / COMPETITIONS</span>
          <ul className="comp-list">
            {track.competitions.map((item, index) => (
              <li key={item}>
                <span>
                  <b>{String(index + 1).padStart(2, '0')}</b>
                  {item}
                </span>
                <i aria-hidden="true">▸</i>
              </li>
            ))}
          </ul>
        </div>

        <footer className="dossier__foot" aria-hidden="true">
          <span>{track.code} // 2026</span>
          <span>ROUTE CONFIRMED</span>
        </footer>
      </article>
    </div>
  )
}

export function TracksSection({
  activeId,
  onSelect,
}: {
  activeId: TrackId
  onSelect: (id: TrackId) => void
}) {
  const activeTrack = getTrackById(activeId) ?? tracks[0]
  const [displayedId, setDisplayedId] = useState(activeId)
  const [switching, setSwitching] = useState(false)
  const switchTimer = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const autoPauseUntil = useRef(0)
  const reduced = useReducedMotion()
  const restrictedCount = tracks.filter((track) => track.restricted).length

  useEffect(() => {
    if (activeId !== displayedId) {
      setDisplayedId(activeId)
      setSwitching(false)
    }
    return () => {
      if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
    }
  }, [activeId, displayedId])

  const displayedTrack = getTrackById(displayedId) ?? activeTrack

  const handleSelect = (id: TrackId) => {
    autoPauseUntil.current = performance.now() + 2000
    setDisplayedId(id)
    setSwitching(true)
    onSelect(id)
    if (switchTimer.current !== null) window.clearTimeout(switchTimer.current)
    switchTimer.current = window.setTimeout(() => {
      setSwitching(false)
      switchTimer.current = null
    }, 420)
  }

  useRafLoop(({ time }) => {
    if (reduced || window.innerWidth <= 1024 || time < autoPauseUntil.current) return
    const section = sectionRef.current
    if (!section) return
    const travel = Math.max(1, section.offsetHeight - window.innerHeight)
    const progress = clamp(-section.getBoundingClientRect().top / travel, 0, 1)
    const next = tracks[Math.min(tracks.length - 1, Math.floor(progress * tracks.length))]
    if (next && next.id !== activeId) onSelect(next.id)
  }, !reduced)

  return (
    <section id="paths" ref={sectionRef} className="section tracks">
      <span className="ghost-word" aria-hidden="true">
        PATHS
      </span>
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="01" en="TECHNICAL PATHS" label="技术分路" />
            <Reveal>
              <h2 className="section-title">
                四条分路
                <br />
                <GlitchText text="同时开启" />
              </h2>
            </Reveal>
          </div>
          <div className="section-side-col">
            <p className="section-side">
              选择你的计算方向。
              <br />
              可以从兴趣出发，也可以从问题出发。
            </p>
            <div className="aside-elig">
              <b className="elig-open">
                <i aria-hidden="true">✓</i>
                AI 算法 / 数据分析 · 不限专业开放
              </b>
              <span className="elig-note">AI 全栈 / 网安方向限计算机、电子信息相关专业</span>
            </div>
          </div>
        </div>

        <div className="track-grid">
          <Reveal>
            <TrackSelector
              activeId={activeId}
              onSelect={handleSelect}
              restrictedCount={restrictedCount}
            />
          </Reveal>
          <Reveal delay={140}>
            <Dossier track={displayedTrack} switching={switching} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
