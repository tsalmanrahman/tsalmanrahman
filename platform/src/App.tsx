import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import rawBundle from './data/ecosystem.generated.json'
import type { AiSkillEntry, EcosystemBundle, ProjectItem } from './types/ecosystem'
import { EditorialTopBar, STORY_CHAPTERS } from './components/EditorialTopBar'
import { EditorialFlybar } from './components/EditorialFlybar'
import { EditorialDrawer, type EditorialDrawerMode } from './components/EditorialDrawer'
import { PortraitHeroStage } from './components/PortraitHeroStage'
import { AboutChapter } from './components/AboutChapter'
import { WorkChapter } from './components/WorkChapter'
import { CredentialsChapter } from './components/CredentialsChapter'
import { JourneyChapter } from './components/JourneyChapter'
import { ProfilesChapter } from './components/ProfilesChapter'
import { ContactChapter } from './components/ContactChapter'
import { AiSkillsHubSection } from './components/AiSkillsHubSection'
import { CommandPalette } from './components/CommandPalette'
import { VerificationModal } from './components/VerificationModal'

gsap.registerPlugin(ScrollTrigger)

const bundle = rawBundle as unknown as EcosystemBundle

export const App: React.FC = () => {
  const [commandOpen, setCommandOpen] = useState(false)
  const [verificationOpen, setVerificationOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<EditorialDrawerMode>('closed')
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<AiSkillEntry | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showFlybar, setShowFlybar] = useState(false)
  const [activeChapterId, setActiveChapterId] = useState<string>('about')
  const lenisRef = useRef<Lenis | null>(null)

  // Support deep linking via ?work=<project-id> (vadimcarazan.com convention)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const workId = params.get('work')
    if (!workId) return
    const found = bundle.projects.find((p) => p.verified && p.id === workId)
    if (found) {
      setSelectedProject(found)
      setDrawerMode('project')
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
      // Ignore history mutation errors in sandboxed contexts
    }
  }, [])

  const openProjectDrawer = useCallback(
    (project: ProjectItem) => {
      setSelectedProject(project)
      setDrawerMode('project')
      updateUrlWorkParam(project.id)
    },
    [updateUrlWorkParam],
  )

  const openSelectedDrawer = useCallback(() => {
    setSelectedProject(null)
    setDrawerMode('selected')
    updateUrlWorkParam(null)
  }, [updateUrlWorkParam])

  const closeDrawer = useCallback(() => {
    setDrawerMode('closed')
    setSelectedProject(null)
    updateUrlWorkParam(null)
  }, [updateUrlWorkParam])

  // Smooth scrolling (Lenis) + subtle editorial reveal triggers + deterministic chapter tracking
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const chapterIds = [...STORY_CHAPTERS.map((c) => c.id), 'skills-hub']

    const updateScrollState = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      setScrollProgress(Math.min(Math.max(window.scrollY / maxScroll, 0), 1))
      setShowFlybar(window.scrollY > Math.max(window.innerHeight * 0.52, 340))

      const triggerY = Math.max(window.innerHeight * 0.42, 240)
      let currentId = 'about'
      for (const id of chapterIds) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= triggerY) {
          currentId = id
        }
      }
      setActiveChapterId(currentId)
    }

    window.addEventListener('scroll', updateScrollState, { passive: true })
    updateScrollState()

    if (reducedMotion) {
      return () => {
        window.removeEventListener('scroll', updateScrollState)
      }
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    const onLenisScroll = () => {
      ScrollTrigger.update()
      updateScrollState()
    }
    lenis.on('scroll', onLenisScroll)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.chapter-reveal').forEach((section) => {
        gsap.from(section, {
          opacity: 0,
          y: 26,
          duration: 0.72,
          ease: 'power3.out',
          clearProps: 'opacity,transform',
          scrollTrigger: {
            trigger: section,
            start: 'top 86%',
            once: true,
          },
        })
      })
    })

    return () => {
      window.removeEventListener('scroll', updateScrollState)
      ctx.revert()
      gsap.ticker.remove(tick)
      lenis.off('scroll', onLenisScroll)
      lenis.destroy()
      lenisRef.current = null
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  // Global Ctrl+K / Cmd+K shortcut for Command Palette
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const scrollToSection = useCallback((sectionId: string) => {
    setActiveChapterId(sectionId === 'portrait-stage' ? 'about' : sectionId)
    const lenis = lenisRef.current
    if (sectionId === 'portrait-stage') {
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
      lenis.scrollTo(el, { offset: -64, duration: 0.85 })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleSelectSkillFromPalette = useCallback(
    (skill: AiSkillEntry) => {
      setSelectedSkill(skill)
      scrollToSection('skills-hub')
    },
    [scrollToSection],
  )

  const activeChapter = useMemo(() => {
    if (activeChapterId === 'skills-hub') {
      return {
        id: 'skills-hub',
        index: '10',
        label: 'Skills Hub',
        title: 'Centralized AI Skills Hub',
        subtitle: '32 Free AI Skills & Agent Roster',
      }
    }
    return STORY_CHAPTERS.find((c) => c.id === activeChapterId) ?? STORY_CHAPTERS[0]
  }, [activeChapterId])

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Subtle flat grid paper texture */}
      <div aria-hidden="true" className="hud-grid pointer-events-none fixed inset-0 z-0 opacity-75" />

      <EditorialTopBar
        profileName={bundle.profile.name}
        organization={bundle.profile.organization}
        location={bundle.profile.location}
        activeChapterId={activeChapterId}
        scrollProgress={scrollProgress}
        selectedDrawerOpen={drawerMode !== 'closed'}
        onNavigate={scrollToSection}
        onOpenSelected={openSelectedDrawer}
        onOpenCommandPalette={() => setCommandOpen(true)}
      />

      <main className="relative z-10 pb-24">
        {/* Opening Full-Viewport Interactive Portrait Stage */}
        <PortraitHeroStage
          profile={bundle.profile}
          career={bundle.career}
          identityLock={bundle.identity_lock}
          onExplore={() => scrollToSection('about')}
          onOpenVerificationModal={() => setVerificationOpen(true)}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Section A: About Me & Technical Expertise */}
        <AboutChapter
          profile={bundle.profile}
          career={bundle.career}
          skills={bundle.skills}
          onNavigateChapter={scrollToSection}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Section B: My Work & Projects */}
        <WorkChapter projects={bundle.projects} onSelectProject={openProjectDrawer} />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Sections C & D: Certifications + Badges & Achievements */}
        <CredentialsChapter
          certifications={bundle.certifications}
          achievements={bundle.achievements}
          credlyUrl={bundle.profile.contact.credly}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Sections E & F: Professional Experience + Education */}
        <JourneyChapter
          positions={bundle.experience.positions}
          education={bundle.education}
          languages={bundle.experience.languages}
          yearsSummary={bundle.experience.years_of_experience}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Sections G & H: LinkedIn & Endorsements + GitHub & Telemetry */}
        <ProfilesChapter
          profile={bundle.profile}
          recommendations={bundle.experience.recommendations}
          githubMetrics={bundle.github_metrics}
          lastVerifiedDate={bundle.verification_status.last_verified_date}
          onOpenVerificationModal={() => setVerificationOpen(true)}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Section I: Contact & Direct Channels */}
        <ContactChapter
          profile={bundle.profile}
          identityLock={bundle.identity_lock}
          verificationStatus={bundle.verification_status}
          onOpenVerificationModal={() => setVerificationOpen(true)}
        />

        <div className="hairline-divider mx-auto max-w-[1440px]" />

        {/* Unified Ecosystem Annex: Centralized Free AI Skills Hub */}
        <AiSkillsHubSection
          registry={bundle.ai_skills_registry}
          agentsRoster={bundle.ai_agents}
          selectedSkill={selectedSkill}
          onSelectSkill={setSelectedSkill}
        />
      </main>

      {/* Bottom Floating Chapter & Return HUD (vadimcarazan.com flybar inspiration) */}
      <EditorialFlybar
        visible={showFlybar && drawerMode === 'closed'}
        activeChapter={activeChapter}
        totalChapters={STORY_CHAPTERS.length}
        onOpenIndex={openSelectedDrawer}
        onBackToPortrait={() => scrollToSection('portrait-stage')}
      />

      {/* Left-Docked Glass Drawer (Selected Index & Project Case Study) */}
      <EditorialDrawer
        mode={drawerMode}
        project={selectedProject}
        projects={bundle.projects}
        onClose={closeDrawer}
        onSelectProject={openProjectDrawer}
        onNavigateChapter={scrollToSection}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        bundle={bundle}
        onSelectProject={openProjectDrawer}
        onSelectSkill={handleSelectSkillFromPalette}
        onNavigateSection={scrollToSection}
        onOpenSelected={openSelectedDrawer}
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
