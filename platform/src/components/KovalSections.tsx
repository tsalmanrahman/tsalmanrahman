import React, { useMemo } from 'react'
import { Layers } from 'lucide-react'
import type {
  CertificationItem,
  EducationItem,
  ExperiencePosition,
  GitHubMetrics,
  ProfileData,
  ProjectItem,
  Recommendation,
} from '../types/ecosystem'

interface KovalSectionsProps {
  profile: ProfileData
  projects: ProjectItem[]
  certifications: CertificationItem[]
  positions: ExperiencePosition[]
  education: EducationItem[]
  recommendations: Recommendation[]
  githubMetrics: GitHubMetrics
  skillCount: number
  onInspectProject: (project: ProjectItem) => void
  onOpenSkillsHub: () => void
  onOpenVerificationModal: () => void
}

function resolveProjectImg(path: string): string | null {
  const name = path.trim().split('/').pop()
  return name ? `./assets/projects/${name}` : null
}

function resolveBadgeImg(path: string): string | null {
  const name = path.trim().split('/').pop()
  return name ? `./assets/certificates/${name}` : null
}

export const KovalSections: React.FC<KovalSectionsProps> = ({
  profile,
  projects,
  certifications,
  positions,
  education,
  recommendations,
  githubMetrics,
  skillCount,
  onInspectProject,
  onOpenSkillsHub,
  onOpenVerificationModal,
}) => {
  const visibleProjects = useMemo(
    () =>
      projects.filter(
        (p) => p.verified && p.id !== 'error-storage' && p.id !== 'github-profile-ecosystem',
      ),
    [projects],
  )

  const visibleCerts = useMemo(
    () => certifications.filter((c) => c.verified && c.category === 'certification').slice(0, 3),
    [certifications],
  )

  const totalMb = useMemo(() => {
    const sum = Object.values(githubMetrics.language_bytes ?? {}).reduce(
      (acc, v) => acc + (typeof v === 'number' ? v : 0),
      0,
    )
    return `${(sum / (1024 * 1024)).toFixed(2)} MB`
  }, [githubMetrics.language_bytes])

  return (
    <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
      {/* SECTION 01: SELECTED WORK */}
      <section id="work" className="scroll-mt-24 border-t border-[#111110]/15 py-16 lg:py-24">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em] text-[#111110] sm:text-[48px] lg:text-[56px]">
            <span>Selected </span>
            <span className="font-mono text-[20px] font-normal uppercase tracking-[0.06em] sm:text-[24px]">
              WORK.
            </span>
          </h2>
          <a
            href={profile.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="koval-chip"
          >
            <span className="koval-chip-prefix">/</span>
            <span className="koval-chip-label">github/{githubMetrics.username}</span>
          </a>
        </div>

        {/* 4-Cell Counter Grid (Exact Koval Metric Bar) */}
        <div className="mb-12 grid grid-cols-2 border border-[#111110]/25 bg-white sm:grid-cols-4">
          <div className="border-b border-r border-[#111110]/20 p-5 sm:border-b-0">
            <div className="font-display text-3xl font-bold text-[#111110]">
              0{visibleProjects.length}
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
              VERIFIED SYSTEMS
            </div>
          </div>
          <div className="border-b border-[#111110]/20 p-5 sm:border-b-0 sm:border-r">
            <div className="font-display text-3xl font-bold text-[#111110]">
              0{visibleCerts.length}
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
              BADGE CREDENTIALS
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSkillsHub}
            className="border-r border-[#111110]/20 p-5 text-left transition hover:bg-[#F4F4F2] cursor-pointer"
          >
            <div className="font-display text-3xl font-bold text-[#111110]">{skillCount}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#111110] underline underline-offset-4">
              AI SKILLS HUB →
            </div>
          </button>
          <div className="p-5">
            <div className="font-display text-3xl font-bold text-[#111110]">{totalMb}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
              GITHUB CODEBASE
            </div>
          </div>
        </div>

        {/* Minimal Horizontal Project Rows */}
        <div className="divide-y divide-[#111110]/15 border-y border-[#111110]/15">
          {visibleProjects.map((project, idx) => {
            const imgSrc = resolveProjectImg(project.image_path)
            return (
              <article
                key={project.id}
                className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_244px] lg:gap-12"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
                  <button
                    type="button"
                    onClick={() => onInspectProject(project)}
                    className="block border border-[#111110]/25 bg-[#111110] p-2.5 text-left transition hover:border-[#111110] md:col-span-5 cursor-pointer"
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={project.name}
                        className="h-44 w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-44 w-full flex-col justify-between bg-[#F4F4F2] p-4 text-[#111110]">
                        <Layers className="h-5 w-5" />
                        <span className="font-mono text-xs uppercase tracking-wider">
                          JSON → ECOSYSTEM PIPELINE
                        </span>
                      </div>
                    )}
                  </button>

                  <div className="md:col-span-7">
                    <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
                      0{idx + 1} · {project.category}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-bold tracking-[-0.01em] text-[#111110] sm:text-[28px]">
                      {project.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#3A3A38] sm:text-base">
                      {project.tagline}
                    </p>
                    <p className="mt-3 font-mono text-xs text-[#656561]">
                      {project.tech_stack.slice(0, 5).join(' · ')}
                    </p>
                  </div>
                </div>

                {/* Right Rail Actions */}
                <div className="flex flex-wrap items-center gap-2.5 lg:flex-col lg:items-start lg:justify-center">
                  <button
                    type="button"
                    onClick={() => onInspectProject(project)}
                    className="koval-chip"
                  >
                    <span className="koval-chip-prefix">/</span>
                    <span className="koval-chip-label">inspect</span>
                  </button>
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="koval-chip"
                  >
                    <span className="koval-chip-prefix">/</span>
                    <span className="koval-chip-label">github</span>
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* SECTION 02: VERIFIED CREDENTIALS & BADGES */}
      <section id="credentials" className="scroll-mt-24 py-16 lg:py-24">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em] text-[#111110] sm:text-[48px] lg:text-[56px]">
            <span>Verified </span>
            <span className="font-mono text-[20px] font-normal uppercase tracking-[0.06em] sm:text-[24px]">
              CREDENTIALS.
            </span>
          </h2>
          <a
            href={profile.contact.credly}
            target="_blank"
            rel="noopener noreferrer"
            className="koval-chip"
          >
            <span className="koval-chip-prefix">/</span>
            <span className="koval-chip-label">credly</span>
          </a>
        </div>

        <div className="grid grid-cols-1 border border-[#111110]/25 bg-white sm:grid-cols-2 lg:grid-cols-4">
          {visibleCerts.map((cert) => {
            const badgeSrc = resolveBadgeImg(cert.badge_path)
            return (
              <div
                key={cert.id}
                className="flex flex-col justify-between border-b border-[#111110]/15 p-6 sm:border-r lg:border-b-0"
              >
                <div>
                  <div className="flex h-32 w-full items-center justify-center border border-[#111110]/10 bg-[#F4F4F2] p-4">
                    {badgeSrc && (
                      <img
                        src={badgeSrc}
                        alt={cert.name}
                        className="max-h-24 w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
                    {cert.issuer}
                  </div>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#111110]">
                    {cert.name}
                  </h3>
                  <div className="mt-1 font-mono text-xs text-[#656561]">{cert.issue_date}</div>
                </div>

                {cert.credential_url && (
                  <div className="mt-5">
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="koval-chip"
                    >
                      <span className="koval-chip-prefix">/</span>
                      <span className="koval-chip-label">verify</span>
                    </a>
                  </div>
                )}
              </div>
            )
          })}

          {/* UIU PGDDS Academic Cell */}
          <div className="flex flex-col justify-between p-6">
            <div>
              <div className="flex h-32 w-full items-center justify-center border border-[#111110]/10 bg-[#111110] text-white">
                <span className="font-display text-4xl font-bold tracking-tight">3.56</span>
              </div>
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
                UIU &amp; BITM
              </div>
              <h3 className="mt-1 font-display text-lg font-bold text-[#111110]">
                PGDDS Data Science
              </h3>
              <div className="mt-1 font-mono text-xs text-[#656561]">PGDDS 102 A · 103 A · 2024</div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={onOpenVerificationModal}
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">audit</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: CAREER & EDUCATION LEDGER */}
      <section
        id="journey"
        className="scroll-mt-24 border-t border-[#111110]/15 py-16 lg:py-24"
      >
        <div className="mb-10">
          <h2 className="font-display text-[34px] font-bold leading-tight tracking-[-0.03em] text-[#111110] sm:text-[48px] lg:text-[56px]">
            <span>Career &amp; </span>
            <span className="font-mono text-[20px] font-normal uppercase tracking-[0.06em] sm:text-[24px]">
              EDUCATION.
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_244px] lg:gap-12">
          {/* Hairline Ledger Table */}
          <div className="space-y-8">
            <div>
              <div className="border-b border-[#111110] pb-2 font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
                EXPERIENCE
              </div>
              <div className="divide-y divide-[#111110]/15">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-12 sm:items-baseline"
                  >
                    <div className="font-semibold text-[#111110] sm:col-span-4">
                      {pos.organization}
                    </div>
                    <div className="text-sm text-[#3A3A38] sm:col-span-5">{pos.role}</div>
                    <div className="font-mono text-xs text-[#656561] sm:col-span-3 sm:text-right">
                      {pos.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="border-b border-[#111110] pb-2 font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
                EDUCATION
              </div>
              <div className="divide-y divide-[#111110]/15">
                {education
                  .filter((e) => e.verified)
                  .map((edu) => (
                    <div
                      key={edu.id}
                      className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-12 sm:items-baseline"
                    >
                      <div className="font-semibold text-[#111110] sm:col-span-4">
                        {edu.institution}
                      </div>
                      <div className="text-sm text-[#3A3A38] sm:col-span-5">
                        {edu.degree} {edu.cgpa ? `· CGPA ${edu.cgpa}` : ''}
                      </div>
                      <div className="font-mono text-xs text-[#656561] sm:col-span-3 sm:text-right">
                        {edu.year}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div className="border-b border-[#111110] pb-2 font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
                ENDORSEMENTS
              </div>
              <div className="divide-y divide-[#111110]/15">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-12 sm:items-baseline"
                  >
                    <div className="font-semibold text-[#111110] sm:col-span-4">{rec.author}</div>
                    <div className="text-sm text-[#3A3A38] sm:col-span-6">“{rec.excerpt}”</div>
                    <div className="font-mono text-xs text-[#656561] sm:col-span-2 sm:text-right">
                      {rec.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Right Rail CTA Column */}
          <div className="flex flex-col justify-between border border-[#111110]/20 bg-white p-6 lg:sticky lg:top-28 lg:h-fit">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
                ECOSYSTEM HUB
              </span>
              <p className="mt-3 text-sm leading-relaxed text-[#3A3A38]">
                Browse all {skillCount} audited AI agent skills &amp; orchestrators.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={onOpenSkillsHub}
                className="koval-cut-btn w-full"
              >
                <span className="koval-cut-btn-slit" aria-hidden="true" />
                <span className="koval-cut-btn-body flex-1 text-sm">Open AI Skills Hub</span>
              </button>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={profile.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="koval-chip"
                >
                  <span className="koval-chip-prefix">/</span>
                  <span className="koval-chip-label">linkedin</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
