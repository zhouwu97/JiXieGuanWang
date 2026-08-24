import { useCallback, useEffect, useState } from 'react'
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
import { usePointerMotion } from './motion/usePointerMotion'
import { useScrollProgress } from './motion/useScrollProgress'
import { getActiveSection } from './motion/sectionNavigation'
import './styles.css'

const sectionIds = ['home', 'paths', 'route', 'field', 'activities', 'notice', 'join'] as const

function App() {
  usePointerMotion()
  useScrollProgress()
  const [activeTrackId, setActiveTrackId] = useState<TrackId>('ai-fullstack')
  const [activeSection, setActiveSection] = useState<string>('home')
  const [siteReady, setSiteReady] = useState(false)
  const revealSite = useCallback(() => setSiteReady(true), [])

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    let frame: number | null = null
    const update = () => {
      frame = null
      const headerHeight = document.querySelector<HTMLElement>('.site-header')?.getBoundingClientRect().height ?? 0
      const referenceY = headerHeight + window.innerHeight * 0.2
      const active = getActiveSection(
        sections.map((section) => {
          const rect = section.getBoundingClientRect()
          return { id: section.id, top: rect.top, bottom: rect.bottom }
        }),
        referenceY,
      )
      if (active) setActiveSection((current) => current === active ? current : active)
    }
    const schedule = () => {
      if (frame !== null) return
      if (typeof window.requestAnimationFrame !== 'function') {
        update()
        return
      }
      frame = window.requestAnimationFrame(update)
    }
    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(() => schedule(), { rootMargin: '120px 0px', threshold: 0 })
    sections.forEach((section) => observer?.observe(section))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    schedule()
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div className="app">
      <PointerGlow />
      <BootOverlay onReveal={revealSite} />
      <Header activeSection={activeSection} />
      <main>
        <Hero ready={siteReady} />
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
