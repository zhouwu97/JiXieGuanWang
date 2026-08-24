import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { activityEvent, eventPhotos } from '../data/activities'
import { GlitchText, Reveal, SectionTag } from './common'

const assetBase = import.meta.env.BASE_URL
const autoplayMs = 4500

export function ActivitiesSection() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const count = eventPhotos.length

  const goStep = (step: number) => setIndex((i) => (i + step + count) % count)

  useEffect(() => {
    const reduced =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const timer = window.setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % count)
    }, autoplayMs)
    return () => window.clearInterval(timer)
  }, [paused, count])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return
    const delta = event.clientX - startX.current
    startX.current = null
    if (Math.abs(delta) > 42) goStep(delta < 0 ? 1 : -1)
  }

  const active = eventPhotos[index]

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
              <div className="album__track" style={{ transform: `translateX(-${index * 100}%)` }}>
                {eventPhotos.map((photo) => (
                  <figure className="album__slide" key={photo.id}>
                    <img src={`${assetBase}${photo.image}`} alt={photo.title} loading="lazy" />
                  </figure>
                ))}
              </div>
              <span className="album__stamp" aria-hidden="true">
                {activityEvent.english}
              </span>
              <span className="album__counter" aria-hidden="true">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
              </span>
              <div className="album__nav">
                <button type="button" aria-label="上一张照片" onClick={() => goStep(-1)}>
                  ‹
                </button>
                <button type="button" aria-label="下一张照片" onClick={() => goStep(1)}>
                  ›
                </button>
              </div>
              <div className="album__dots" aria-label="选择第几张照片">
                {eventPhotos.map((photo, photoIndex) => (
                  <button
                    key={photo.id}
                    type="button"
                    aria-label={`第 ${photoIndex + 1} 张：${photo.title}`}
                    aria-pressed={photoIndex === index}
                    className={photoIndex === index ? 'is-active' : ''}
                    onClick={() => setIndex(photoIndex)}
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
