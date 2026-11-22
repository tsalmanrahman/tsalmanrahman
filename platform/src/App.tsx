import React, { useCallback, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import rawBundle from './data/ecosystem.generated.json'
import type { AiSkillEntry, EcosystemBundle, ProjectItem } from './types/ecosystem'
import { CinematicPreloader } from './components/CinematicPreloader'
import { SpatialWebGLCanvas } from './components/SpatialWebGLCanvas'
import { CurvedTransitionOverlay } from './components/CurvedTransitionOverlay'
import { NavigationDock, type ViewMode } from './components/NavigationDock'
import { CommandPalette } from './components/CommandPalette'
import { HeroSection } from './components/HeroSection'
import { EngineeringShowcase } from './components/EngineeringShowcase'
import { SkillsAndTelemetrySection } from './components/SkillsAndTelemetrySection'
import { CareerCredentialsTimeline } from './components/CareerCredentialsTimeline'
import { AiSkillsHubSection } from './components/AiSkillsHubSection'
import { VerificationModal } from './components/VerificationModal'
import { FooterSection } from './components/FooterSection'

gsap.registerPlugin(ScrollTrigger)

const bundle = rawBundle as unknown as EcosystemBundle

const MODE_TITLES: Record<ViewMode, string> = {
  unified: 'Unified Ecosystem',
  portfolio: 'Executive Portfolio',
  skills: 'Centralized AI Skills Hub',
}

export const App: React.FC = () => {
  const [preloaderDone, setPreloaderDone] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('unified')
  const [transitionState, setTransitionState] = useState<{ active: boolean; label: string }>({
    active: false,
    label: '',
  })
  const [commandOpen, setCommandOpen] = useState(false)
  const [verificationOpen, setVerificationOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<AiSkillEntry | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Lenis inertia smooth scroll synced with GSAP ScrollTrigger
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const updateProgress = () => {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      setScrollProgress(Math.min(Math.max(window.scrollY / maxScroll, 0), 1))
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    if (reducedMotion) {
      return () => {
        window.removeEventListener('scroll', updateProgress)
      }
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    const onLenisScroll = () => {
      ScrollTrigger.update()
      updateProgress()
    }
    lenis.on('scroll', onLenisScroll)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      gsap.ticker.remove(tick)
      lenis.off('scroll', onLenisScroll)
      lenis.destroy()
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [viewMode])

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

  const handleChangeViewMode = useCallback(
    (nextMode: ViewMode, anchorId?: string) => {
      const scrollToTarget = (id?: string) => {
        if (!id) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

      if (nextMode === viewMode) {
        scrollToTarget(anchorId)
        return
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducedMotion) {
        setViewMode(nextMode)
        window.setTimeout(() => scrollToTarget(anchorId), 40)
        return
      }

      setTransitionState({ active: true, label: MODE_TITLES[nextMode] })
      window.setTimeout(() => {
        setViewMode(nextMode)
        window.setTimeout(() => {
          scrollToTarget(anchorId)
          setTransitionState({ active: false, label: '' })
        }, 120)
      }, 320)
    },
    [viewMode],
  )

  const handleSelectProjectFromPalette = useCallback(
    (project: ProjectItem) => {
      if (viewMode === 'skills') {
        setViewMode('unified')
      }
      setSelectedProject(project)
    },
    [viewMode],
  )

  const handleSelectSkillFromPalette = useCallback(
    (skill: AiSkillEntry) => {
      if (viewMode === 'portfolio') {
        setViewMode('unified')
      }
      setSelectedSkill(skill)
    },
    [viewMode],
  )

  const showPortfolio = viewMode === 'unified' || viewMode === 'portfolio'
  const showSkillsHub = viewMode === 'unified' || viewMode === 'skills'

  return (
    <div className="relative min-h-screen bg-[#060A13] text-slate-100">
      {!preloaderDone && (
        <CinematicPreloader
          onComplete={() => setPreloaderDone(true)}
          sha256Prefix={bundle.identity_lock.sha256.slice(0, 12)}
          skillCount={bundle.ai_skills_registry.skills.length}
        />
      )}

      <SpatialWebGLCanvas />

      <CurvedTransitionOverlay active={transitionState.active} label={transitionState.label} />

      <NavigationDock
        viewMode={viewMode}
        onChangeViewMode={handleChangeViewMode}
        onOpenCommandPalette={() => setCommandOpen(true)}
        scrollProgress={scrollProgress}
        profileName={bundle.profile.name}
        availableForHire={bundle.career.available_for_hire}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        bundle={bundle}
        onSelectProject={handleSelectProjectFromPalette}
        onSelectSkill={handleSelectSkillFromPalette}
        onSwitchMode={handleChangeViewMode}
      />

      <main className="relative z-10">
        <HeroSection
          profile={bundle.profile}
          career={bundle.career}
          githubMetrics={bundle.github_metrics}
          identityLock={bundle.identity_lock}
          certifications={bundle.certifications}
          skillCount={bundle.ai_skills_registry.skills.length}
          agentCount={bundle.ai_agents.agents.length}
          onJump={handleChangeViewMode}
          onOpenVerificationModal={() => setVerificationOpen(true)}
        />

        <div className="hairline-divider mx-auto max-w-7xl" />

        {showPortfolio && (
          <>
            <EngineeringShowcase
              projects={bundle.projects}
              selectedProject={selectedProject}
              onSelectProject={setSelectedProject}
            />

            <div className="hairline-divider mx-auto max-w-7xl" />

            <SkillsAndTelemetrySection
              skills={bundle.skills}
              githubMetrics={bundle.github_metrics}
              pillars={bundle.profile.problem_solving_approach}
              recommendations={bundle.experience.recommendations}
            />

            <div className="hairline-divider mx-auto max-w-7xl" />

            <CareerCredentialsTimeline
              positions={bundle.experience.positions}
              education={bundle.education}
              certifications={bundle.certifications}
              achievements={bundle.achievements}
              languages={bundle.experience.languages}
              onOpenVerificationModal={() => setVerificationOpen(true)}
            />
          </>
        )}

        {showPortfolio && showSkillsHub && (
          <div className="hairline-divider mx-auto max-w-7xl" />
        )}

        {showSkillsHub && (
          <AiSkillsHubSection
            registry={bundle.ai_skills_registry}
            agentsRoster={bundle.ai_agents}
            selectedSkill={selectedSkill}
            onSelectSkill={setSelectedSkill}
          />
        )}
      </main>

      <FooterSection
        profile={bundle.profile}
        identityLock={bundle.identity_lock}
        verificationStatus={bundle.verification_status}
        onOpenVerificationModal={() => setVerificationOpen(true)}
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
