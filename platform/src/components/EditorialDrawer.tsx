import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Copy, FolderGit2, Layers } from 'lucide-react'
import type { ProjectItem } from '../types/ecosystem'
import { STORY_CHAPTERS } from './EditorialTopBar'

export type EditorialDrawerMode = 'closed' | 'selected' | 'project'

interface EditorialDrawerProps {
  mode: EditorialDrawerMode
  project: ProjectItem | null
  projects: ProjectItem[]
  onClose: () => void
  onSelectProject: (project: ProjectItem) => void
  onNavigateChapter: (chapterId: string) => void
}

export function resolveProjectPreviewPath(project: ProjectItem): string | null {
  if (!project.image_path) return null
  const filename = project.image_path.split('/').pop()
  return filename ? `./assets/projects/${filename}` : null
}

export const EditorialDrawer: React.FC<EditorialDrawerProps> = ({
  mode,
  project,
  projects,
  onClose,
  onSelectProject,
  onNavigateChapter,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (mode === 'closed') return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, onClose])

  if (mode === 'closed') return null

  const verifiedProjects = projects.filter((p) => p.verified && p.id !== 'error-storage')

  const handleCopyProjectLink = async () => {
    if (!project) return
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?work=${encodeURIComponent(
        project.id,
      )}`
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      // Clipboard may be blocked in restricted browser sessions
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'project' && project ? `${project.name} Case Study` : 'Selected Index'}
      className="fixed inset-0 z-[90] flex items-stretch justify-start bg-slate-950/35 p-2 sm:p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[calc(100vh-1rem)] w-full max-w-[540px] flex-col overflow-y-auto rounded-3xl border border-slate-200 bg-white/96 p-5 shadow-2xl backdrop-blur-xl sm:max-h-[calc(100vh-2rem)] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Action Header */}
        <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-md sm:-mx-7 sm:-mt-7 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition hover:border-blue-400 hover:text-slate-950 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Close</span>
          </button>

          {mode === 'selected' && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              Selected Index
            </span>
          )}

          {mode === 'project' && project && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyProjectLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-700 transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-950 bg-slate-950 px-3.5 py-1.5 text-xs font-medium text-white transition hover:border-blue-600 hover:bg-blue-600"
              >
                <FolderGit2 className="h-3.5 w-3.5" />
                <span>GitHub Repo</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* SELECTED INDEX VIEW */}
        {mode === 'selected' && (
          <div className="flex flex-1 flex-col justify-between space-y-8">
            <div>
              <h2 className="font-editorial text-4xl italic leading-tight text-slate-950 sm:text-[42px]">
                Explore Salman&apos;s work &amp; story.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Inspect curated SQL Server, .NET ERP, and Python architecture case studies or jump
                directly into any verified chapter.
              </p>

              {/* Featured Case Studies Index */}
              <div className="mt-7">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Selected Systems ({verifiedProjects.length})
                </p>
                <ol className="divide-y divide-slate-200/80 border-y border-slate-200/80">
                  {verifiedProjects.map((item, idx) => {
                    const thumb = resolveProjectPreviewPath(item)
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onSelectProject(item)}
                          className="group flex w-full items-center justify-between gap-4 py-3.5 text-left transition hover:bg-slate-50/80 cursor-pointer"
                        >
                          <div className="flex min-w-0 items-center gap-3.5">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 bg-[#0B1220] object-contain p-1"
                              />
                            ) : (
                              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-blue-600">
                                <Layers className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="truncate font-editorial text-2xl italic text-slate-950 transition group-hover:text-blue-700">
                                {item.name}
                              </div>
                              <div className="truncate font-mono text-[11px] text-slate-500">
                                {item.category}
                              </div>
                            </div>
                          </div>
                          <span className="shrink-0 font-mono text-xs text-slate-400 transition group-hover:text-blue-600">
                            0{idx + 1}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>
              </div>

              {/* Complete 9 Chapters Story Index */}
              <div className="mt-7">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Story Chapters (01–09 + AI Hub)
                </p>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {STORY_CHAPTERS.map((chapter) => (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => {
                        onClose()
                        onNavigateChapter(chapter.id)
                      }}
                      className="flex items-baseline justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50/60 cursor-pointer"
                    >
                      <span className="font-sans text-xs font-medium text-slate-800">
                        {chapter.title}
                      </span>
                      <span className="font-mono text-[10px] text-blue-600">{chapter.index}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onNavigateChapter('skills-hub')
                    }}
                    className="flex items-baseline justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-left transition hover:border-amber-400 sm:col-span-2 cursor-pointer"
                  >
                    <span className="font-sans text-xs font-semibold text-amber-950">
                      Centralized Free AI Skills Hub &amp; Agent Roster
                    </span>
                    <span className="font-mono text-[10px] text-amber-700">10 · HUB</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
              All work entries, credentials, and metrics originate strictly from{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">
                profile-data/*.json
              </code>
              .
            </div>
          </div>
        )}

        {/* PROJECT DETAIL VIEW */}
        {mode === 'project' && project && (
          <div className="space-y-6">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-blue-600">
                {project.category}
              </div>
              <h2 className="mt-1.5 font-editorial text-4xl italic leading-tight text-slate-950">
                {project.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{project.tagline}</p>
            </div>

            {resolveProjectPreviewPath(project) && (
              <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1220] p-3">
                <img
                  src={resolveProjectPreviewPath(project) ?? ''}
                  alt={`${project.name} architecture visual`}
                  className="max-h-60 w-full object-contain"
                />
              </figure>
            )}

            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Architectural Overview
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{project.description}</p>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                Salman&apos;s Direct Engineering Contribution
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
                {project.my_contribution}
              </p>
            </div>

            {project.key_features.length > 0 && (
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  Key System Capabilities
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {project.key_features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Technology Stack
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Embedded Vadim-inspired closing CTA card */}
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Discuss SQL or ERP architecture?
              </p>
              <p className="mt-1 font-editorial text-2xl italic text-slate-950">
                Let&apos;s design resilient data systems together.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigateChapter('contact')
                  }}
                  className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-600 cursor-pointer"
                >
                  Start a conversation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onNavigateChapter('work')
                  }}
                  className="font-mono text-xs font-medium text-slate-700 underline underline-offset-4 hover:text-slate-950 cursor-pointer"
                >
                  Browse all projects
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
