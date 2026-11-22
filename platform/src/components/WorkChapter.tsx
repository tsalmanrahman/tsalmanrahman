import React, { useState } from 'react'
import { ArrowUpRight, CheckCircle2, FolderGit2, Layers } from 'lucide-react'
import type { ProjectItem } from '../types/ecosystem'
import { resolveProjectPreviewPath } from './EditorialDrawer'

interface WorkChapterProps {
  projects: ProjectItem[]
  onSelectProject: (project: ProjectItem) => void
}

const DOMAIN_DISCIPLINES = [
  'SQL Development & T-SQL',
  'Database Engineering',
  'Enterprise ERP Systems',
  'Query Optimization',
  'Power BI & DAX',
  'Data Analytics',
  'Python (FastAPI)',
  'C# (.NET 10)',
  'Business Intelligence & Crystal Reports',
]

export const WorkChapter: React.FC<WorkChapterProps> = ({ projects, onSelectProject }) => {
  const visibleProjects = projects.filter((p) => p.verified && p.id !== 'error-storage')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })

  const hoveredProject = visibleProjects.find((p) => p.id === hoveredId) ?? null
  const hoveredPreview = hoveredProject ? resolveProjectPreviewPath(hoveredProject) : null

  return (
    <section
      id="work"
      data-chapter="work"
      className="chapter-reveal relative z-10 mx-auto max-w-[1440px] scroll-mt-14 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Chapter Header */}
      <div className="mb-10 grid grid-cols-1 gap-6 border-b border-slate-200/90 pb-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            02 / 09 — MY WORK &amp; PROJECTS
          </span>
          <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Production database architecture, ERP platforms &amp; analytical tooling.
          </h2>
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-wrap gap-1.5 lg:justify-end">
            {DOMAIN_DISCIPLINES.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Showcase Gallery */}
      <div
        className="relative space-y-6"
        onMouseMove={(e) => setCursorPos({ x: e.clientX, y: e.clientY })}
      >
        {visibleProjects.map((project, idx) => {
          const previewSrc = resolveProjectPreviewPath(project)
          return (
            <article
              key={project.id}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="editorial-surface group grid grid-cols-1 gap-6 rounded-3xl p-5 sm:p-7 lg:grid-cols-12 lg:items-center"
            >
              {/* Visual Preview Plate */}
              <div className="lg:col-span-5">
                {previewSrc ? (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#0B1220] p-3 text-left transition group-hover:border-blue-400 cursor-pointer"
                  >
                    <img
                      src={previewSrc}
                      alt={`${project.name} architecture preview`}
                      className="h-52 w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="flex h-52 w-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition group-hover:border-blue-400 cursor-pointer"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] font-semibold text-blue-700">
                      <span>JSON → VALIDATED ECOSYSTEM</span>
                      <Layers className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-editorial text-3xl italic text-slate-950">
                        Single Source of Truth Architecture
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-slate-600">
                        Schema-Validated Data · CI/CD Automation · AI Skills Hub
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Project Story & Stack */}
              <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-700">
                      0{idx + 1} · {project.category}
                    </span>
                    {project.featured && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-800">
                        FEATURED CASE STUDY
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 font-editorial text-3xl italic leading-tight text-slate-950 transition group-hover:text-blue-700 sm:text-4xl">
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      className="text-left cursor-pointer"
                    >
                      {project.name}
                    </button>
                  </h3>
                  <p className="mt-1 text-sm font-medium text-slate-700">{project.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {project.description}
                  </p>

                  {project.key_features[0] && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{project.my_contribution}</span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tech_stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-medium text-white transition hover:border-blue-600 hover:bg-blue-600 cursor-pointer"
                  >
                    <span>Open Case Study Drawer</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 font-mono text-xs text-slate-700 transition hover:border-blue-400 hover:text-blue-700"
                  >
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>GitHub Repository</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          )
        })}

        {/* Floating Desktop Cursor Case Study Preview */}
        {hoveredProject && hoveredPreview && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed z-40 hidden w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl xl:block"
            style={{
              left: Math.min(cursorPos.x + 24, window.innerWidth - 280),
              top: Math.max(cursorPos.y - 96, 80),
            }}
          >
            <img
              src={hoveredPreview}
              alt=""
              className="h-32 w-full rounded-xl bg-[#0B1220] object-contain"
            />
            <div className="px-2 py-1.5 font-editorial text-lg italic text-slate-950">
              {hoveredProject.name}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
