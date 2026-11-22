import React, { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import rawBundle from './data/ecosystem.generated.json'
import type { EcosystemBundle, ProjectItem } from './types/ecosystem'
import { KovalHeader } from './components/KovalHeader'
import { KovalHero } from './components/KovalHero'
import { KovalSections } from './components/KovalSections'
import { KovalFooter } from './components/KovalFooter'
import { KovalInspectorDrawer } from './components/KovalInspectorDrawer'
import { KovalPageRail } from './components/KovalPageRail'
import { CommandPalette } from './components/CommandPalette'
import { VerificationModal } from './components/VerificationModal'

const bundle = rawBundle as unknown as EcosystemBundle

const TRACKED_SECTIONS = ['top', 'work', 'credentials', 'journey', 'contact']

export const App: React.FC = () => {
  const [commandOpen, setCommandOpen] = useState(false)
  const [paletteSeed, setPaletteSeed] = useState('')
  const [verificationOpen, setVerificationOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string>('top')
  const [overDarkFooter, setOverDarkFooter] = useState<boolean>(false)
  const lenisRef = useRef<Lenis | null>(null)

  // Deep link via ?work=<project-id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const workId = params.get('work')
    if (!workId) return
    const found = bundle.projects.find((p) => p.verified && p.id === workId)
    if (found) {
      setSelectedProject(found)
    }
  }, [])

  const updateUrlWorkParam = useCallback((projectId: string | null) => {
    try {
      const url = new URL(window.location.href)
      if (projectId) {
        url.searchParams.set('work', projectId)
      } else {
        url.searchParams.delete('work')
      }
      window.history.replaceState({}, '', url.toString())
    } catch {
      // Ignore history mutation errors in restricted contexts
    }
  }, [])

  const handleInspectProject = useCallback(
    (project: ProjectItem) => {
      setSelectedProject(project)
      updateUrlWorkParam(project.id)
    },
    [updateUrlWorkParam],
  )

  const handleCloseProject = useCallback(() => {
    setSelectedProject(null)
    updateUrlWorkParam(null)
  }, [updateUrlWorkParam])

  // Pause Lenis and lock background document scroll whenever any modal/drawer is open
  const anyOverlayOpen = Boolean(selectedProject) || commandOpen || verificationOpen

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (anyOverlayOpen) {
      lenisRef.current?.stop()
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''
      lenisRef.current?.start()
    }

    return () => {
      html.style.overflow = ''
      body.style.overflow = ''
      lenisRef.current?.start()
    }
  }, [anyOverlayOpen])

  // Lenis smooth scroll + deterministic active section & dark-footer contrast tracking
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const updateScrollState = () => {
      const triggerY = Math.max(window.innerHeight * 0.42, 240)
      let currentId = 'top'
      for (const id of TRACKED_SECTIONS) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= triggerY) {
          currentId = id
        }
      }
      setActiveSectionId(currentId)

      const contactEl = document.getElementById('contact')
      if (contactEl) {
        setOverDarkFooter(contactEl.getBoundingClientRect().top <= window.innerHeight * 0.55)
      }
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()

    if (reducedMotion) {
      return () => window.removeEventListener('scroll', updateScrollState)
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    const onLenisScroll = () => updateScrollState()
    lenis.on('scroll', onLenisScroll)

    let rafId = 0
    const loop = (time: number) => {
      lenis.raf(time)
      rafId = window.requestAnimationFrame(loop)
    }
    rafId = window.requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('scroll', updateScrollState)
      window.cancelAnimationFrame(rafId)
      lenis.off('scroll', onLenisScroll)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteSeed('')
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId)
    const lenis = lenisRef.current
    if (sectionId === 'top') {
      if (lenis) {
        lenis.scrollTo(0, { duration: 0.85 })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }
    const el = document.getElementById(sectionId)
    if (!el) return
    if (lenis) {
      lenis.scrollTo(el, { offset: -72, duration: 0.85 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleHeroSearch = useCallback((query: string) => {
    setPaletteSeed(query)
    setCommandOpen(true)
  }, [])

  return (
    <div className="koval-dots relative min-h-screen bg-white text-[#111110]">
      <KovalHeader
        githubUrl={bundle.profile.contact.github}
        linkedinUrl={bundle.profile.contact.linkedin}
        activeSectionId={activeSectionId}
        onNavigate={scrollToSection}
      />

      <main>
        <KovalHero
          profile={bundle.profile}
          identityLock={bundle.identity_lock}
          onExploreWork={() => scrollToSection('work')}
          onSearchPortal={handleHeroSearch}
        />

        <KovalSections
          profile={bundle.profile}
          projects={bundle.projects}
          certifications={bundle.certifications}
          positions={bundle.experience.positions}
          education={bundle.education}
          recommendations={bundle.experience.recommendations}
          githubMetrics={bundle.github_metrics}
          onInspectProject={handleInspectProject}
          onOpenVerificationModal={() => setVerificationOpen(true)}
        />
      </main>

      <KovalFooter profile={bundle.profile} />

      <KovalPageRail
        activeSectionId={activeSectionId}
        overDarkFooter={overDarkFooter}
        onNavigate={scrollToSection}
      />

      <KovalInspectorDrawer project={selectedProject} onClose={handleCloseProject} />

      <CommandPalette
        open={commandOpen}
        initialQuery={paletteSeed}
        onClose={() => setCommandOpen(false)}
        bundle={bundle}
        onSelectProject={handleInspectProject}
        onNavigateSection={scrollToSection}
      />

      <VerificationModal
        open={verificationOpen}
        onClose={() => setVerificationOpen(false)}
        verificationStatus={bundle.verification_status}
        identityLock={bundle.identity_lock}
      />
    </div>
  )
}

export default App
