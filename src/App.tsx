import { useEffect, useState } from 'react'
import type { TrackId } from './data/tracks'
import { BootOverlay, PointerGlow } from './components/common'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { TracksSection } from './components/Tracks'
import { RouteSection } from './components/Route'
import { ProjectSection } from './components/Project'
import { ActivitiesSection } from './components/Activities'
import { BriefingSection } from './components/Briefing'
import { JoinSection } from './components/Join'
import './styles.css'

const sectionIds = ['home', 'paths', 'route', 'field', 'activities', 'notice', 'join'] as const

function App() {
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('ai-fullstack')
  const [activeSection, setActiveSection] = useState<string>('home')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: '-38% 0px -52% 0px', threshold: 0 },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined
    }
    let ring: HTMLSpanElement | null = null
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.( '.btn, .album__arrow') as HTMLElement | null
      if (!target) return
      ring?.remove()
      ring = document.createElement('span')
      ring.className = 'btn-ripple'
      const size = Math.max(target.offsetWidth, target.offsetHeight) * 1.1
      ring.style.width = `${size}px`
      ring.style.height = `${size}px`
      ring.style.left = `${event.clientX - target.getBoundingClientRect().left - size / 2}px`
      ring.style.top = `${event.clientY - target.getBoundingClientRect().top - size / 2}px`
      target.appendChild(ring)
      ring.addEventListener('animationend', () => ring?.remove(), { once: true })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div className="app">
      <PointerGlow />
      <BootOverlay />
      <Header activeSection={activeSection} />
      <main>
        <Hero />
        <TracksSection activeId={activeTrackId} onSelect={setActiveTrackId} />
        <RouteSection />
        <ProjectSection />
        <ActivitiesSection />
        <BriefingSection />
        <JoinSection />
      </main>
    </div>
  )
}

export default App
