import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Command, Layers, Menu, ShieldCheck, X } from 'lucide-react'

export interface StoryChapter {
  id: string
  index: string
  label: string
  title: string
  subtitle: string
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'about',
    index: '01',
    label: 'About',
    title: 'About Me',
    subtitle: 'Narrative, Approach & Core Stack',
  },
  {
    id: 'work',
    index: '02',
    label: 'Work',
    title: 'My Work & Projects',
    subtitle: 'ERP, SQL Server & Python Systems',
  },
  {
    id: 'certifications',
    index: '03',
    label: 'Certifications',
    title: 'My Certifications',
    subtitle: 'IBM, Google & Microsoft Verified',
  },
  {
    id: 'badges',
    index: '04',
    label: 'Badges',
    title: 'Badges & Milestones',
    subtitle: 'Verified Honors & Visual Badges',
  },
  {
    id: 'experience',
    index: '05',
    label: 'Experience',
    title: 'Professional Experience',
    subtitle: 'HATIM GROUP & Logic InfoTech Ltd',
  },
  {
    id: 'education',
    index: '06',
    label: 'Education',
    title: 'Academic Credentials',
    subtitle: 'UIU PGDDS (3.56) & Varendra CSE',
  },
  {
    id: 'linkedin',
    index: '07',
    label: 'LinkedIn',
    title: 'LinkedIn & Endorsements',
    subtitle: 'Identity & Recommendations',
  },
  {
    id: 'github',
    index: '08',
    label: 'GitHub',
    title: 'GitHub & Telemetry',
    subtitle: 'Repositories & Language Bytes',
  },
  {
    id: 'contact',
    index: '09',
    label: 'Contact',
    title: 'Contact & Audit',
    subtitle: 'Direct Channels & Identity Lock',
  },
]

interface EditorialTopBarProps {
  profileName: string
  organization: string
  location: string
  activeChapterId: string
  scrollProgress: number
  selectedDrawerOpen: boolean
  onNavigate: (targetId: string) => void
  onOpenSelected: () => void
  onOpenCommandPalette: () => void
}

function getDhakaClock(): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Dhaka',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date())
  } catch {
    return '--:--'
  }
}

export const EditorialTopBar: React.FC<EditorialTopBarProps> = ({
  profileName,
  organization,
  location,
  activeChapterId,
  scrollProgress,
  selectedDrawerOpen,
  onNavigate,
  onOpenSelected,
  onOpenCommandPalette,
}) => {
  const [dhakaTime, setDhakaTime] = useState<string>(() => getDhakaClock())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDhakaTime(getDhakaClock())
    }, 15000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  const navItems: Array<{ label: string; targetId?: string; isSelected?: boolean; matchIds: string[] }> =
    [
      { label: 'Selected', isSelected: true, matchIds: [] },
      { label: 'About', targetId: 'about', matchIds: ['about'] },
      { label: 'Work', targetId: 'work', matchIds: ['work'] },
      {
        label: 'Credentials',
        targetId: 'certifications',
        matchIds: ['certifications', 'badges'],
      },
      {
        label: 'Journey',
        targetId: 'experience',
        matchIds: ['experience', 'education', 'linkedin', 'github'],
      },
      { label: 'Skills Hub', targetId: 'skills-hub', matchIds: ['skills-hub'] },
      { label: 'Contact', targetId: 'contact', matchIds: ['contact'] },
    ]

  const handleJump = (targetId: string) => {
    setMobileMenuOpen(false)
    onNavigate(targetId)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-[#F8FAFC]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center lg:gap-5 lg:px-8">
          {/* Column 1: Monogram Mark */}
          <div className="flex items-center gap-3">
            <a
              href="#portrait-stage"
              onClick={(e) => {
                e.preventDefault()
                handleJump('portrait-stage')
              }}
              aria-label={`${profileName} — Return to top portrait`}
              className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-2.5 font-editorial text-lg italic tracking-tight text-white transition hover:border-blue-600 hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              SR
            </a>
            <div className="leading-tight lg:hidden">
              <div className="font-display text-sm font-bold tracking-tight text-slate-950">
                {profileName}
              </div>
              <div className="font-mono text-[10px] text-slate-500">
                Dhaka ({dhakaTime})
              </div>
            </div>
          </div>

          {/* Column 2: Currently */}
          <button
            type="button"
            onClick={() => handleJump('experience')}
            className="hidden min-w-0 text-left leading-snug lg:block cursor-pointer group"
          >
            <span className="block font-mono text-[10px] text-slate-500">Currently:</span>
            <span className="block truncate text-xs font-medium text-slate-800 transition group-hover:text-blue-700">
              Executive (IT &amp; MIS), {organization}
            </span>
          </button>

          {/* Column 3: Based in + Live Dhaka Clock */}
          <button
            type="button"
            onClick={() => handleJump('about')}
            className="hidden min-w-0 text-left leading-snug lg:block cursor-pointer group"
          >
            <span className="block font-mono text-[10px] text-slate-500">Based in:</span>
            <span className="block truncate text-xs font-medium text-slate-800 transition group-hover:text-blue-700">
              {location}{' '}
              <span className="font-mono text-[11px] text-slate-500">
                (<time dateTime={dhakaTime}>{dhakaTime}</time>)
              </span>
            </span>
          </button>

          {/* Column 4: Editorial Comma-Separated Navigation + Search */}
          <div className="flex items-center gap-2.5">
            <nav aria-label="Primary Editorial Navigation" className="hidden text-right lg:block">
              <span className="block font-mono text-[10px] text-slate-500">Navigation:</span>
              <div className="flex flex-nowrap items-center gap-1 text-xs font-medium text-slate-700">
                {navItems.map((item, idx) => {
                  const isActive = item.isSelected
                    ? selectedDrawerOpen
                    : item.matchIds.includes(activeChapterId)
                  return (
                    <React.Fragment key={item.label}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.isSelected) {
                            onOpenSelected()
                          } else if (item.targetId) {
                            handleJump(item.targetId)
                          }
                        }}
                        className={`whitespace-nowrap transition cursor-pointer hover:text-slate-950 ${
                          isActive
                            ? 'text-slate-950 underline decoration-blue-600 decoration-2 underline-offset-4'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.label}
                      </button>
                      {idx < navItems.length - 1 && (
                        <span aria-hidden="true" className="text-slate-400">
                          ,
                        </span>
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </nav>

            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Open Command Search"
              className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 font-mono text-xs text-slate-700 shadow-2xs transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <Command className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 xl:inline">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open Chapter Menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-2xs transition hover:border-blue-400 hover:text-blue-700 lg:hidden cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Scroll Progress Hairline */}
        <div className="h-[2px] w-full bg-slate-200/70">
          <div
            className="h-full bg-blue-600 transition-[width] duration-75"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>
      </header>

      {/* Mobile / Tablet Slide-Over Index Drawer (Portaled to document.body) */}
      {mobileMenuOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Story Navigation Menu"
            className="fixed inset-0 z-[90] flex justify-end bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-full max-w-sm flex-col justify-between overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600">
                    <Layers className="h-4 w-4" />
                    STORY INDEX
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close Menu"
                    className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-blue-400 hover:text-slate-950 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onOpenSelected()
                    }}
                    className="mb-4 flex w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-left font-editorial text-xl italic text-blue-900 cursor-pointer"
                  >
                    <span>Open Selected Case Studies</span>
                    <span className="font-mono text-xs not-italic text-blue-700">↗</span>
                  </button>

                  <div className="space-y-1">
                    {STORY_CHAPTERS.map((chapter) => (
                      <button
                        key={chapter.id}
                        type="button"
                        onClick={() => handleJump(chapter.id)}
                        className="flex w-full items-baseline justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-[11px] text-blue-600">
                            {chapter.index}
                          </span>
                          <span className="font-editorial text-xl italic text-slate-950">
                            {chapter.title}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">↓</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleJump('skills-hub')}
                      className="flex w-full items-baseline justify-between rounded-xl border-t border-slate-100 px-3 py-3 text-left transition hover:bg-amber-50/60 cursor-pointer"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-[11px] text-amber-600">10</span>
                        <span className="font-editorial text-xl italic text-slate-950">
                          Centralized AI Skills Hub
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-amber-600">↓</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 border-t border-slate-200 pt-4 font-mono text-[11px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span>LOCATION</span>
                  <span className="text-slate-800">
                    {location} ({dhakaTime})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    IDENTITY LOCK
                  </span>
                  <span className="text-emerald-700">SHA-256 VERIFIED</span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
