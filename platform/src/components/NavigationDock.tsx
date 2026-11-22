import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Command, Cpu, Layers, Menu, ShieldCheck, X } from 'lucide-react'

export type ViewMode = 'unified' | 'portfolio' | 'skills'

interface NavigationDockProps {
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode, anchorId?: string) => void
  onOpenCommandPalette: () => void
  scrollProgress: number
  profileName: string
  availableForHire: boolean
}

const MODE_LABELS: Array<{ id: ViewMode; label: string; short: string }> = [
  { id: 'unified', label: 'Unified Ecosystem', short: 'Unified' },
  { id: 'portfolio', label: 'Executive Portfolio', short: 'Portfolio' },
  { id: 'skills', label: 'AI Skills Hub', short: 'Skills Hub' },
]

const NAV_LINKS: Array<{ label: string; anchor: string; mode: ViewMode }> = [
  { label: '01 · Overview', anchor: 'hero', mode: 'unified' },
  { label: '02 · Engineering', anchor: 'projects', mode: 'portfolio' },
  { label: '03 · Capabilities', anchor: 'capabilities', mode: 'portfolio' },
  { label: '04 · Career & Credentials', anchor: 'timeline', mode: 'portfolio' },
  { label: '05 · AI Skills Hub', anchor: 'skills-hub', mode: 'skills' },
  { label: '06 · Multi-Agent Team', anchor: 'agent-team', mode: 'skills' },
]

export const NavigationDock: React.FC<NavigationDockProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenCommandPalette,
  scrollProgress,
  profileName,
  availableForHire,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  const handleLinkClick = (mode: ViewMode, anchor: string) => {
    setDrawerOpen(false)
    onChangeViewMode(mode, anchor)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault()
              onChangeViewMode('unified', 'hero')
            }}
            className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-900 bg-slate-950 text-white shadow-xs transition group-hover:border-blue-600 group-hover:bg-blue-600">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-tight text-slate-950">
                  {profileName}
                </span>
                <span
                  title="Identity Lock Verified"
                  className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-emerald-700 sm:inline-flex"
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                  LOCKED
                </span>
              </div>
              <span className="block font-mono text-[10px] tracking-wider text-slate-500">
                {availableForHire ? 'SQL · ERP · AI SKILLS HUB' : 'ENTERPRISE DATA PLATFORM'}
              </span>
            </div>
          </a>

          <nav
            aria-label="Workspace View Mode"
            className="hidden items-center rounded-full border border-slate-200/90 bg-slate-100/90 p-1 md:flex"
          >
            {MODE_LABELS.map((mode) => {
              const active = viewMode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChangeViewMode(mode.id)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-xs transition-all cursor-pointer ${
                    active
                      ? 'border border-slate-200 bg-white font-semibold text-slate-950 shadow-xs'
                      : 'border border-transparent text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {mode.label}
                </button>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Open Command Palette"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-700 shadow-xs transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <Command className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              aria-label="Toggle Navigation Menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
            >
              {drawerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Mode Switcher Strip */}
        <div className="flex items-center justify-center gap-1 border-t border-slate-200/70 bg-slate-50/70 px-3 py-1.5 md:hidden">
          {MODE_LABELS.map((mode) => {
            const active = viewMode === mode.id
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeViewMode(mode.id)}
                className={`flex-1 rounded-full px-2.5 py-1 font-mono text-[11px] transition cursor-pointer ${
                  active
                    ? 'border border-slate-200 bg-white font-semibold text-slate-950 shadow-xs'
                    : 'border border-transparent text-slate-600 hover:text-slate-950'
                }`}
              >
                {mode.short}
              </button>
            )
          })}
        </div>

        {/* Scroll Progress Hairline */}
        <div className="h-[2px] w-full bg-slate-200/70">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 transition-[width] duration-75"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>
      </header>

      {/* Editorial Slide-Out Navigation Drawer (Portaled to document.body) */}
      {drawerOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation Drawer"
            className="fixed inset-0 z-[90] flex justify-end bg-slate-950/35 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="relative flex h-full w-full max-w-md flex-col justify-between border-l border-slate-200 bg-white p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-600">
                    <Layers className="h-4 w-4" />
                    NAVIGATION INDEX
                  </span>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close Navigation Drawer"
                    className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-blue-400 hover:text-slate-950 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-8 space-y-2">
                  {NAV_LINKS.map((item) => (
                    <button
                      key={item.anchor}
                      type="button"
                      onClick={() => handleLinkClick(item.mode, item.anchor)}
                      className="flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 text-left font-display text-xl font-medium text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-800 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs text-slate-400">↗</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-5 font-mono text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>IDENTITY STATUS</span>
                  <span className="font-semibold text-emerald-700">SHA-256 VERIFIED</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>DATA SOURCE</span>
                  <span className="font-semibold text-blue-700">LINKEDIN + GITHUB</span>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
