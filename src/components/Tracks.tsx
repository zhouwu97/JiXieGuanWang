import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import {
  getTrackById,
  tracks,
  type TrackDefinition,
  type TrackId,
} from '../data/tracks'
import {
  getAdjacentTrackIndex,
  TRACK_ENTER_MS,
  TRACK_EXIT_MS,
} from '../motion/trackTransition'
import { GlitchText, Reveal, SectionTag } from './common'

export type TrackTransitionPhase = 'stable' | 'exiting' | 'entering'

function clearTimer(timerRef: { current: number | null }) {
  if (timerRef.current === null) return
  window.clearTimeout(timerRef.current)
  timerRef.current = null
}

function TrackSelector({
  activeId,
  onSelect,
  restrictedCount,
}: {
  activeId: TrackId
  onSelect: (id: TrackId) => void
  restrictedCount: number
}) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = getAdjacentTrackIndex(index, 1, tracks.length)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = getAdjacentTrackIndex(index, -1, tracks.length)
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tracks.length - 1
    }
    if (nextIndex === null || nextIndex < 0) return
    event.preventDefault()
    const nextTrack = tracks[nextIndex]
    onSelect(nextTrack.id)
    document.getElementById(`track-tab-${nextTrack.id}`)?.focus()
  }

  return (
    <div role="tablist" aria-label="技术方向选择" className="track-selector">
      {tracks.map((track, index) => (
        <button
          key={track.id}
          type="button"
          role="tab"
          id={`track-tab-${track.id}`}
          aria-controls={`track-panel-${track.id}`}
          aria-label={track.name}
          aria-selected={activeId === track.id}
          tabIndex={activeId === track.id ? 0 : -1}
          className={activeId === track.id ? 'track-row is-active' : 'track-row'}
          style={{ '--track-accent': track.accent } as CSSProperties}
          onClick={() => onSelect(track.id)}
          onKeyDown={(event) => onKeyDown(event, index)}
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

function Dossier({ track, phase }: { track: TrackDefinition; phase: TrackTransitionPhase }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const boundsRef = useRef<DOMRect | null>(null)

  const resetTilt = useCallback(() => {
    const el = frameRef.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }, [])

  useEffect(() => {
    if (phase === 'stable') return
    boundsRef.current = null
    resetTilt()
  }, [phase, resetTilt])

  const onPointerEnter = () => {
    if (phase !== 'stable') return
    boundsRef.current = frameRef.current?.getBoundingClientRect() ?? null
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || phase !== 'stable') return
    const el = frameRef.current
    if (!el) return
    const bounds = boundsRef.current ?? el.getBoundingClientRect()
    boundsRef.current = bounds
    const dx = (event.clientX - bounds.left) / bounds.width - 0.5
    const dy = (event.clientY - bounds.top) / bounds.height - 0.5
    el.style.setProperty('--tilt-x', `${(-dy * 3.2).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(dx * 3.2).toFixed(2)}deg`)
  }

  const onPointerLeave = () => {
    boundsRef.current = null
    resetTilt()
  }

  return (
    <div
      ref={frameRef}
      className="tilt"
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <article
        className={`dossier${phase === 'stable' ? '' : ` is-${phase}`}`}
        role="tabpanel"
        id={`track-panel-${track.id}`}
        aria-labelledby={`track-tab-${track.id}`}
        tabIndex={0}
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
  const [displayedId, setDisplayedId] = useState<TrackId>(activeId)
  const [phase, setPhase] = useState<TrackTransitionPhase>('stable')
  const displayedIdRef = useRef<TrackId>(activeId)
  const phaseRef = useRef<TrackTransitionPhase>('stable')
  const pendingIdRef = useRef<TrackId | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const enterTimerRef = useRef<number | null>(null)
  const lastActiveIdRef = useRef<TrackId>(activeId)
  const restrictedCount = tracks.filter((track) => track.restricted).length

  const updateDisplayedId = (id: TrackId) => {
    displayedIdRef.current = id
    setDisplayedId(id)
  }

  const updatePhase = (nextPhase: TrackTransitionPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }

  const requestTransition = useCallback((id: TrackId) => {
    const beginExit = () => {
      clearTimer(exitTimerRef)
      clearTimer(enterTimerRef)
      updatePhase('exiting')
      exitTimerRef.current = window.setTimeout(() => {
        exitTimerRef.current = null
        const target = pendingIdRef.current
        pendingIdRef.current = null
        if (target === null || target === displayedIdRef.current) {
          updatePhase('stable')
          return
        }

        updateDisplayedId(target)
        updatePhase('entering')
        enterTimerRef.current = window.setTimeout(() => {
          enterTimerRef.current = null
          if (pendingIdRef.current !== null && pendingIdRef.current !== displayedIdRef.current) {
            beginExit()
            return
          }
          pendingIdRef.current = null
          updatePhase('stable')
        }, TRACK_ENTER_MS)
      }, TRACK_EXIT_MS)
    }

    if (id === displayedIdRef.current) {
      pendingIdRef.current = null
      clearTimer(exitTimerRef)
      clearTimer(enterTimerRef)
      updatePhase('stable')
      return
    }

    pendingIdRef.current = id
    if (phaseRef.current === 'exiting') return
    beginExit()
  }, [])

  useEffect(() => {
    if (activeId === lastActiveIdRef.current) return
    lastActiveIdRef.current = activeId
    requestTransition(activeId)
  }, [activeId, requestTransition])

  useEffect(() => () => {
    clearTimer(exitTimerRef)
    clearTimer(enterTimerRef)
  }, [])

  const displayedTrack = getTrackById(displayedId) ?? activeTrack

  const handleSelect = (id: TrackId) => {
    if (id === activeId && id === displayedIdRef.current && phaseRef.current === 'stable') return
    lastActiveIdRef.current = id
    requestTransition(id)
    if (id !== activeId) onSelect(id)
  }

  return (
    <section id="paths" className="section tracks">
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
            <Dossier track={displayedTrack} phase={phase} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
