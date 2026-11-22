import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Code2, Database, Search, Sparkles, X } from 'lucide-react'
import type { AiSkillEntry, EcosystemBundle, ProjectItem, SkillEntry } from '../types/ecosystem'
import { STORY_CHAPTERS } from './EditorialTopBar'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  bundle: EcosystemBundle
  onSelectProject: (project: ProjectItem) => void
  onSelectSkill: (skill: AiSkillEntry) => void
  onNavigateSection: (sectionId: string) => void
  onOpenSelected: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  bundle,
  onSelectProject,
  onSelectSkill,
  onNavigateSection,
  onOpenSelected,
}) => {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const normalized = query.trim().toLowerCase()

  const matchedChapters = useMemo(() => {
    const allChapters = [
      ...STORY_CHAPTERS,
      {
        id: 'skills-hub',
        index: '10',
        label: 'Skills Hub',
        title: 'AI Skills Hub',
        subtitle: '32 Free AI Skills & Agent Roster',
      },
    ]
    if (!normalized) return allChapters.slice(0, 6)
    return allChapters.filter(
      (c) =>
        c.title.toLowerCase().includes(normalized) ||
        c.label.toLowerCase().includes(normalized) ||
        c.subtitle.toLowerCase().includes(normalized),
    )
  }, [normalized])

  const matchedProjects = useMemo(() => {
    return bundle.projects
      .filter((p) => p.verified && p.id !== 'error-storage')
      .filter(
        (p) =>
          !normalized ||
          p.name.toLowerCase().includes(normalized) ||
          p.tagline.toLowerCase().includes(normalized) ||
          p.tech_stack.some((t) => t.toLowerCase().includes(normalized)),
      )
      .slice(0, 4)
  }, [bundle.projects, normalized])

  const matchedSkills = useMemo(() => {
    return bundle.ai_skills_registry.skills
      .filter(
        (s) =>
          !normalized ||
          s.name.toLowerCase().includes(normalized) ||
          s.domain.toLowerCase().includes(normalized) ||
          s.summary.toLowerCase().includes(normalized) ||
          s.tags.some((t) => t.toLowerCase().includes(normalized)),
      )
      .slice(0, 6)
  }, [bundle.ai_skills_registry.skills, normalized])

  const matchedTech = useMemo(() => {
    const flat = (Object.entries(bundle.skills) as Array<[string, SkillEntry[]]>).flatMap(
      ([cat, items]) => items.map((item) => ({ ...item, category: cat })),
    )
    return flat
      .filter(
        (s) =>
          !normalized ||
          s.name.toLowerCase().includes(normalized) ||
          s.focus.toLowerCase().includes(normalized) ||
          s.category.toLowerCase().includes(normalized),
      )
      .slice(0, 4)
  }, [bundle.skills, normalized])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Search"
      className="fixed inset-0 z-[90] flex items-start justify-center bg-slate-950/35 px-4 pt-20 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5">
          <Search className="h-4 w-4 text-blue-600" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters, projects, SQL Server stack, certifications, or 32 AI skills..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="rounded-lg border border-slate-200 bg-slate-50 p-1 text-slate-500 hover:text-slate-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-3">
          {/* Quick Story Jumps */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Story Chapters &amp; Index
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenSelected()
                }}
                className="font-mono text-[10px] font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Open Selected Index Drawer
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {matchedChapters.map((chap) => (
                <button
                  key={chap.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigateSection(chap.id)
                  }}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-800 hover:border-blue-300 hover:bg-blue-50/70 cursor-pointer"
                >
                  <span className="truncate">
                    <span className="mr-1.5 font-mono text-[10px] text-blue-600">{chap.index}</span>
                    {chap.title}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                </button>
              ))}
            </div>
          </div>

          {matchedProjects.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Verified Case Studies
              </p>
              <div className="space-y-1">
                {matchedProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onClose()
                      onSelectProject(project)
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-blue-50 cursor-pointer"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Code2 className="h-4 w-4 shrink-0 text-blue-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{project.name}</p>
                        <p className="truncate text-xs text-slate-500">{project.tagline}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] font-semibold text-blue-700">
                      CASE STUDY
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedSkills.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Centralized Free AI Skills
              </p>
              <div className="space-y-1">
                {matchedSkills.map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => {
                      onClose()
                      onSelectSkill(skill)
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-amber-50 cursor-pointer"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Sparkles className="h-4 w-4 shrink-0 text-amber-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{skill.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {skill.domain} · {skill.source_type}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700">
                      FREE / OSS
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTech.length > 0 && (
            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Technical Capabilities
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {matchedTech.map((tech) => (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => {
                      onClose()
                      onNavigateSection('about')
                    }}
                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
                  >
                    <Database className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-900">{tech.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{tech.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
