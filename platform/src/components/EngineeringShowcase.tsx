import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, CheckCircle2, FolderGit2, Layers, X } from 'lucide-react'
import type { ProjectItem } from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'

interface EngineeringShowcaseProps {
  projects: ProjectItem[]
  selectedProject: ProjectItem | null
  onSelectProject: (project: ProjectItem | null) => void
}

function resolveProjectPreview(project: ProjectItem): string | null {
  if (!project.image_path) return null
  const filename = project.image_path.split('/').pop()
  return filename ? `./assets/projects/${filename}` : null
}

export const EngineeringShowcase: React.FC<EngineeringShowcaseProps> = ({
  projects,
  selectedProject,
  onSelectProject,
}) => {
  const visibleProjects = projects.filter((p) => p.verified && p.id !== 'error-storage')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const hoveredProject = visibleProjects.find((p) => p.id === hoveredId) ?? null
  const hoveredPreview = hoveredProject ? resolveProjectPreview(hoveredProject) : null

  useEffect(() => {
    if (!selectedProject) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelectProject(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedProject, onSelectProject])

  return (
    <section
      id="projects"
      className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            01 // VERIFIED ENGINEERING SYSTEMS
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Production Architecture &amp; Case Studies
          </h2>
        </div>
        <p className="max-w-md text-sm text-slate-600">
          Verified repositories engineered across Microsoft SQL Server, .NET 10, Python FastAPI,
          and automated GitHub ecosystem pipelines.
        </p>
      </div>

      {/* Dennis Snellenberg inspired interactive showcase grid with floating preview */}
      <div
        className="relative grid grid-cols-1 gap-6 lg:grid-cols-3"
        onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
      >
        {visibleProjects.map((project, idx) => {
          const previewSrc = resolveProjectPreview(project)
          return (
            <article
              key={project.id}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="glass-panel group flex flex-col justify-between rounded-3xl p-6 transition duration-300 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-medium text-blue-700">
                    0{idx + 1} · {project.category}
                  </span>
                  {project.featured && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800">
                      FEATURED
                    </span>
                  )}
                </div>

                {previewSrc ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1220] p-2 shadow-inner">
                    <img
                      src={previewSrc}
                      alt={`${project.name} architecture preview`}
                      className="h-36 w-full object-contain transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className="mt-4 flex h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-blue-700">
                      <span>UNIFIED ARCHITECTURE</span>
                      <Layers className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-display text-base font-bold text-slate-950">
                        JSON Source of Truth → SVG &amp; Web Platform
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-slate-600">
                        Schema-validated + Atomic Rollback + AI Skills Hub
                      </p>
                    </div>
                  </div>
                )}

                <h3 className="mt-5 font-display text-xl font-bold text-slate-950 transition group-hover:text-blue-700">
                  {project.name}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-slate-700">{project.tagline}</p>
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600">
                  {project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tech_stack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectProject(project)}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  Inspect Architecture
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                >
                  <FolderGit2 className="h-3.5 w-3.5" />
                  Repo
                </a>
              </div>
            </article>
          )
        })}

        {/* Floating Cursor Preview Card (desktop pointer hover only) */}
        {hoveredProject && hoveredPreview && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-40 hidden w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl xl:block"
            style={{
              left: Math.min(cursorPos.x + 22, window.innerWidth - 280),
              top: Math.max(cursorPos.y - 90, 80),
            }}
          >
            <img
              src={hoveredPreview}
              alt=""
              className="h-32 w-full rounded-xl bg-[#0B1220] object-contain"
            />
            <div className="px-2 py-1.5 font-mono text-[10px] font-semibold text-blue-700">
              OPEN CASE STUDY // {hoveredProject.id.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Case Study Modal (Portaled to document.body above header stacking context) */}
      {selectedProject &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProject.name} Case Study`}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-md"
            onClick={() => onSelectProject(null)}
          >
            <div
              className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-blue-600">
                    {selectedProject.category}
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-slate-950 sm:text-3xl">
                    {selectedProject.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedProject.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectProject(null)}
                  aria-label="Close Case Study Modal"
                  className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-blue-400 hover:text-slate-950 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {resolveProjectPreview(selectedProject) && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1220] p-3">
                  <img
                    src={resolveProjectPreview(selectedProject) ?? ''}
                    alt={selectedProject.name}
                    className="max-h-56 w-full object-contain"
                  />
                </div>
              )}

              <div className="mt-6 space-y-5">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Architectural Overview
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {selectedProject.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Salman&apos;s Direct Engineering Contribution
                  </h4>
                  <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-950">
                    {selectedProject.my_contribution}
                  </p>
                </div>

                {selectedProject.key_features.length > 0 && (
                  <div>
                    <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
                      Key System Capabilities
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {selectedProject.key_features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Technology Stack
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedProject.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-medium text-blue-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
                <MagneticButton variant="ghost" onClick={() => onSelectProject(null)}>
                  Close
                </MagneticButton>
                <MagneticButton href={selectedProject.repo_url} target="_blank" variant="primary">
                  <FolderGit2 className="h-4 w-4" />
                  View Source on GitHub
                  <ArrowUpRight className="h-4 w-4" />
                </MagneticButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
