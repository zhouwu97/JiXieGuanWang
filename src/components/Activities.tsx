import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent as ReactTransitionEvent,
} from 'react'
import { activityEvent, eventPhotos, type EventPhoto } from '../data/activities'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL
const autoplayMs = 4500

interface SlideEntry {
  key: string
  photo: EventPhoto
  clone: boolean
}

export function ActivitiesSection() {
  const count = eventPhotos.length
  const [pos, setPos] = useState(1)
  const [instant, setInstant] = useState(false)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const entries: SlideEntry[] = [
    { key: 'clone-last', photo: eventPhotos[count - 1], clone: true },
    ...eventPhotos.map((photo, index) => ({ key: photo.id, photo, clone: false })),
    { key: 'clone-first', photo: eventPhotos[0], clone: true },
  ]

  const realIndex = pos === 0 ? count - 1 : pos === count + 1 ? 0 : pos - 1
  const active = eventPhotos[realIndex]

  const goStep = (step: number) => {
    setPos((prev) => Math.max(0, Math.min(count + 1, prev + step)))
  }

  useEffect(() => {
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const timer = window.setInterval(() => {
      if (!paused) setPos((prev) => Math.min(count + 1, prev + 1))
    }, autoplayMs)
    return () => window.clearInterval(timer)
  }, [paused, count])

  useEffect(() => {
    if (!instant) return undefined
    const timer = window.setTimeout(() => setInstant(false), 60)
    return () => window.clearTimeout(timer)
  }, [instant])

  const onTransitionEnd = (event: ReactTransitionEvent<HTMLDivElement>) => {
    if (event.target !== trackRef.current) return
    if (pos === 0) {
      setInstant(true)
      setPos(count)
    } else if (pos === count + 1) {
      setInstant(true)
      setPos(1)
    }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    startX.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (Math.abs(delta) > 42) goStep(delta < 0 ? 1 : -1)
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
          <div className="album" role="region" aria-label="活动现场相册">
            <div className="album__head">
              <strong className="album__name">{activityEvent.name}</strong>
              <span className="album__meta">
                ◆ {activityEvent.date} · {activityEvent.venue}
              </span>
            </div>

            <div
              className="album__media"
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerLeave={() => {
                startX.current = null
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
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
                {entries.map((entry) => (
                  <figure
                    className={`album__slide${!entry.clone && entry.photo.id === active.id ? ' is-current' : ''}`}
                    key={entry.key}
                    aria-hidden={entry.clone || undefined}
                  >
                    <img
                      src={`${assetBase}${entry.photo.image}`}
                      alt={entry.clone ? '' : entry.photo.title}
                      loading="lazy"
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
                onClick={() => goStep(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="album__arrow album__arrow--next"
                aria-label="下一张照片"
                onClick={() => goStep(1)}
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
                    onClick={() => setPos(photoIndex + 1)}
                  />
                ))}
              </div>
            </div>

            <div className="album__caption" key={active.id} aria-live="polite">
              <span className="album__caption-date">◆ {activityEvent.date}</span>
              <h3>{active.title}</h3>
              <p>{active.desc}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
