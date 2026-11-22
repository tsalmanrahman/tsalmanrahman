import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Code2, Database, Search, Sparkles, X } from 'lucide-react'
import type { AiSkillEntry, EcosystemBundle, ProjectItem, SkillEntry } from '../types/ecosystem'

interface CommandPaletteProps {
  open: boolean
  initialQuery?: string
  onClose: () => void
  bundle: EcosystemBundle
  onSelectProject: (project: ProjectItem) => void
  onSelectSkill: (skill: AiSkillEntry) => void
  onNavigateSection: (sectionId: string) => void
  onOpenSkillsHub: () => void
}

const SECTION_LINKS = [
  { id: 'work', title: 'Selected Work' },
  { id: 'credentials', title: 'Verified Credentials' },
  { id: 'journey', title: 'Career & Education' },
  { id: 'contact', title: 'Contact' },
]

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  initialQuery = '',
  onClose,
  bundle,
  onSelectProject,
  onSelectSkill,
  onNavigateSection,
  onOpenSkillsHub,
}) => {
  const [query, setQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setQuery(initialQuery)
      window.setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open, initialQuery])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const normalized = query.trim().toLowerCase()

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
      aria-label="Portal Search"
      className="fixed inset-0 z-[90] flex items-start justify-center bg-[#111110]/40 px-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden border border-[#111110] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[#111110]/20 px-4 py-3.5">
          <Search className="h-4 w-4 text-[#111110]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, SQL stack, credentials, or 32 AI skills..."
            className="w-full bg-transparent text-sm text-[#111110] placeholder:text-[#656561] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Search"
            className="border border-[#111110] p-1 text-[#111110] hover:bg-[#111110] hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SECTION_LINKS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  onClose()
                  onNavigateSection(sec.id)
                }}
                className="flex items-center justify-between border border-[#111110]/20 bg-[#F4F4F2] px-3 py-2 text-left text-xs font-medium text-[#111110] hover:border-[#111110] cursor-pointer"
              >
                <span>{sec.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onClose()
                onOpenSkillsHub()
              }}
              className="flex items-center justify-between border border-[#111110] bg-[#111110] px-3 py-2 text-left text-xs font-medium text-white hover:bg-white hover:text-[#111110] cursor-pointer"
            >
              <span>AI Skills Hub (32)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {matchedProjects.length > 0 && (
            <div>
              <p className="pb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#656561]">
                Work
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
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F4F4F2] cursor-pointer"
                  >
                    <Code2 className="h-4 w-4 shrink-0 text-[#111110]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#111110]">
                        {project.name}
                      </p>
                      <p className="truncate text-xs text-[#656561]">{project.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedSkills.length > 0 && (
            <div>
              <p className="pb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#656561]">
                AI Skills
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
                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F4F4F2] cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-[#111110]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#111110]">{skill.name}</p>
                      <p className="truncate font-mono text-xs text-[#656561]">{skill.domain}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedTech.length > 0 && (
            <div>
              <p className="pb-1.5 font-mono text-[10px] uppercase tracking-widest text-[#656561]">
                Technical Stack
              </p>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {matchedTech.map((tech) => (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => {
                      onClose()
                      onNavigateSection('journey')
                    }}
                    className="flex items-center gap-2.5 border border-[#111110]/20 bg-[#F4F4F2] px-3 py-2 text-left hover:border-[#111110] cursor-pointer"
                  >
                    <Database className="h-3.5 w-3.5 shrink-0 text-[#111110]" />
                    <span className="truncate text-xs font-medium text-[#111110]">
                      {tech.name}
                    </span>
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
