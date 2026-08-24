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
import { usePointerMotion } from './motion/usePointerMotion'
import { useScrollProgress } from './motion/useScrollProgress'
import './styles.css'

const sectionIds = ['home', 'paths', 'route', 'field', 'activities', 'notice', 'join'] as const

function App() {
  usePointerMotion()
  useScrollProgress()
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
