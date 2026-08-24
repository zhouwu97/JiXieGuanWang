import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from 'react'
import { activityEvent, eventPhotos, type EventPhoto } from '../data/activities'
import { useReducedMotion } from '../motion/useReducedMotion'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL
const AUTOPLAY_MS = 4500

type SlideChangeSource = 'auto' | 'arrow' | 'dot' | 'swipe' | 'keyboard'

interface SlideEntry {
  key: string
  photo: EventPhoto
  clone: boolean
}

function isInteractiveTarget(target: EventTarget | null) {
  return typeof Element !== 'undefined'
    && target instanceof Element
    && Boolean(target.closest('button,a,input,textarea,select,[role="button"]'))
}

function getRealIndex(position: number, count: number) {
  if (position === 0) return count - 1
  if (position === count + 1) return 0
  return position - 1
}

export function ActivitiesSection() {
  const count = eventPhotos.length
  const [pos, setPos] = useState(1)
  const [instant, setInstant] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [focusInside, setFocusInside] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [sectionVisible, setSectionVisible] = useState(true)
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible',
  )
  const [autoplayReset, setAutoplayReset] = useState(0)
  const [announcement, setAnnouncement] = useState('')
  const startX = useRef<number | null>(null)
  const posRef = useRef(1)
  const instantFrameRef = useRef<number | null>(null)
  const albumRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const entries: SlideEntry[] = [
    { key: 'clone-last', photo: eventPhotos[count - 1], clone: true },
    ...eventPhotos.map((photo, index) => ({ key: photo.id, photo, clone: false })),
    { key: 'clone-first', photo: eventPhotos[0], clone: true },
  ]

  const realIndex = getRealIndex(pos, count)
  const active = eventPhotos[realIndex]

  const updatePosition = useCallback((nextPosition: number, source: SlideChangeSource) => {
    const safePosition = Math.max(0, Math.min(count + 1, nextPosition))
    posRef.current = safePosition
    setPos(safePosition)
    if (source !== 'auto') {
      setAnnouncement(eventPhotos[getRealIndex(safePosition, count)].title)
      setAutoplayReset((current) => current + 1)
    }
  }, [count])

  const goStep = useCallback((step: number, source: SlideChangeSource) => {
    updatePosition(posRef.current + step, source)
  }, [updatePosition])

  const goTo = useCallback((index: number, source: SlideChangeSource) => {
    updatePosition(index + 1, source)
  }, [updatePosition])

  const reduced = useReducedMotion()
  const autoplayAllowed =
    !reduced
    && !hovered
    && !dragging
    && !focusInside
    && !userPaused
    && sectionVisible
    && pageVisible

  useEffect(() => {
    if (!autoplayAllowed) return undefined
    const timer = window.setTimeout(() => goStep(1, 'auto'), AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [autoplayAllowed, autoplayReset, goStep, realIndex])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  useEffect(() => {
    const album = albumRef.current
    if (!album || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => setSectionVisible(entries[0]?.isIntersecting ?? false),
      { rootMargin: '100px 0px' },
    )
    observer.observe(album)
    return () => observer.disconnect()
  }, [])

  const cancelInstantReset = useCallback(() => {
    if (instantFrameRef.current !== null && typeof window.cancelAnimationFrame === 'function') {
      window.cancelAnimationFrame(instantFrameRef.current)
    }
    instantFrameRef.current = null
  }, [])

  const scheduleInstantReset = useCallback(() => {
    cancelInstantReset()
    if (typeof window.requestAnimationFrame !== 'function') {
      setInstant(false)
      return
    }
    let frameCount = 0
    const nextFrame = () => {
      frameCount += 1
      if (frameCount >= 2) {
        instantFrameRef.current = null
        setInstant(false)
        return
      }
      instantFrameRef.current = window.requestAnimationFrame(nextFrame)
    }
    instantFrameRef.current = window.requestAnimationFrame(nextFrame)
  }, [cancelInstantReset])

  useEffect(() => {
    return cancelInstantReset
  }, [cancelInstantReset])

  const onTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target !== trackRef.current || event.propertyName !== 'transform') return
    if (posRef.current === 0) {
      setInstant(true)
      updatePosition(count, 'auto')
      scheduleInstantReset()
    } else if (posRef.current === count + 1) {
      setInstant(true)
      updatePosition(1, 'auto')
      scheduleInstantReset()
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return
    startX.current = event.clientX
    setDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const cancelDrag = () => {
    startX.current = null
    setDragging(false)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    startX.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }
    if (Math.abs(delta) > 42) goStep(delta < 0 ? 1 : -1, 'swipe')
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      goStep(event.key === 'ArrowRight' ? 1 : -1, 'keyboard')
    }
  }

  return (
    <section id="activities" className="section archive">
      <span className="ghost-word" aria-hidden="true">
        LOG
      </span>
      <div className="container">
        <div className="section-heading section-heading--split">
          <div>
            <SectionTag number="04" en="CAMPUS RECORDS" label="社团活动" />
            <h2 className="section-title">
              技术不止在屏幕里
              <br />
              <GlitchText text="还能办成现场" />
            </h2>
          </div>
          <p className="section-side">
            线下分享、现场实操、大合影。
            <br />
            每一次活动，都是真实发生的证据。
          </p>
        </div>

        <Reveal>
          <div
            ref={albumRef}
            className="album"
            role="region"
            aria-label="活动现场相册"
            onFocusCapture={() => setFocusInside(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setFocusInside(false)
              }
            }}
          >
            <div className="album__head">
              <strong className="album__name">{activityEvent.name}</strong>
              <div className="album__head-actions">
                <span className="album__meta">
                  ◆ {activityEvent.date} · {activityEvent.venue}
                </span>
                <button
                  type="button"
                  className="album__toggle"
                  aria-label={userPaused ? '继续相册自动播放' : '暂停相册自动播放'}
                  onClick={() => setUserPaused((current) => !current)}
                >
                  {userPaused ? 'PLAY' : 'PAUSE'}
                </button>
              </div>
            </div>

            <div
              className="album__media"
              tabIndex={0}
              aria-label="活动照片轮播，使用左右方向键切换"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={cancelDrag}
              onLostPointerCapture={cancelDrag}
              onPointerLeave={cancelDrag}
              onKeyDown={onKeyDown}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <div
                ref={trackRef}
                className="album__track"
                style={{
                  transform: `translateX(-${pos * 100}%)`,
                  transition: instant ? 'none' : undefined,
                }}
                onTransitionEnd={onTransitionEnd}
              >
                {entries.map((entry, index) => (
                  <figure
                    className={`album__slide${index === pos ? ' is-current' : ''}`}
                    key={entry.key}
                    aria-hidden={entry.clone || undefined}
                  >
                    <img
                      src={`${assetBase}${entry.photo.image}`}
                      alt={entry.clone ? '' : entry.photo.title}
                      loading={index === 1 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </figure>
                ))}
              </div>
              <span className="album__stamp" aria-hidden="true">
                {activityEvent.english}
              </span>
              <span className="album__counter" aria-hidden="true">
                {String(realIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <button
                type="button"
                className="album__arrow album__arrow--prev"
                aria-label="上一张照片"
                onClick={() => goStep(-1, 'arrow')}
              >
                ‹
              </button>
              <button
                type="button"
                className="album__arrow album__arrow--next"
                aria-label="下一张照片"
                onClick={() => goStep(1, 'arrow')}
              >
                ›
              </button>
              <div className="album__dots" aria-label="选择第几张照片">
                {eventPhotos.map((photo, photoIndex) => (
                  <button
                    key={photo.id}
                    type="button"
                    aria-label={`第 ${photoIndex + 1} 张：${photo.title}`}
                    aria-pressed={photoIndex === realIndex}
                    className={photoIndex === realIndex ? 'is-active' : ''}
                    onClick={() => goTo(photoIndex, 'dot')}
                  />
                ))}
              </div>
            </div>

            <div className="album__caption" key={active.id}>
              <span className="album__caption-date">◆ {activityEvent.date}</span>
              <h3>{active.title}</h3>
              <p>{active.desc}</p>
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
