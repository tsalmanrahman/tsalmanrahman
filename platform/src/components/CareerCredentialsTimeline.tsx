import React, { useMemo } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import type {
  AchievementItem,
  CertificationItem,
  EducationItem,
  ExperiencePosition,
  LanguageProficiency,
} from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'

export interface CareerCredentialsTimelineProps {
  positions: ExperiencePosition[]
  education: EducationItem[]
  certifications: CertificationItem[]
  achievements: AchievementItem[]
  languages: LanguageProficiency[]
  onOpenVerificationModal: () => void
}

function resolveCertificateBadge(badgePath: string): string | null {
  const trimmed = badgePath.trim()
  if (!trimmed) return null
  const basename = trimmed.split('/').pop()
  return basename ? `./assets/certificates/${basename}` : null
}

export const CareerCredentialsTimeline: React.FC<CareerCredentialsTimelineProps> = ({
  positions,
  education,
  certifications,
  achievements,
  languages,
  onOpenVerificationModal,
}) => {
  const verifiedCertifications = useMemo(
    () => certifications.filter((c) => c.verified && c.category === 'certification'),
    [certifications],
  )

  const verifiedCourses = useMemo(
    () => certifications.filter((c) => c.verified && c.category === 'course'),
    [certifications],
  )

  const verifiedEducation = useMemo(
    () => education.filter((e) => e.verified),
    [education],
  )

  const verifiedAchievements = useMemo(
    () => achievements.filter((a) => a.verified),
    [achievements],
  )

  return (
    <section
      id="timeline"
      className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-blue-600">
            03 // CAREER, EDUCATION &amp; CREDENTIALS
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Verified Professional Track
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Audited employment history, academic qualifications, verified third-party credentials,
            and engineering milestones grounded in primary sources.
          </p>
        </div>

        <MagneticButton
          variant="secondary"
          onClick={onOpenVerificationModal}
          ariaLabel="Inspect Source Verification"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Inspect Source Verification</span>
        </MagneticButton>
      </div>

      {/* Employment Timeline + Academic Credentials */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Employment Timeline */}
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
              <Briefcase className="h-4 w-4" />
            </span>
            <h3 className="font-display text-xl font-bold text-slate-950">Employment Timeline</h3>
          </div>

          <div className="relative space-y-6 before:absolute before:top-6 before:bottom-6 before:left-4 before:w-px before:bg-slate-200">
            {positions.map((pos) => (
              <article
                key={pos.id}
                className="glass-panel relative ml-10 rounded-3xl p-6 transition hover:border-blue-300"
              >
                {/* Timeline node */}
                <span
                  aria-hidden="true"
                  className={`absolute top-7 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border bg-white ${
                    pos.current
                      ? 'border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.28)]'
                      : 'border-blue-400'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      pos.current ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />
                </span>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-700">
                        {pos.organization}
                      </span>
                      {pos.current && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Current
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1 font-display text-lg font-bold text-slate-950">{pos.role}</h4>
                  </div>

                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[11px] text-blue-700">
                    {pos.period}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    {pos.location}
                  </span>
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">
                    {pos.work_mode}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-700">{pos.summary}</p>

                {pos.responsibilities.length > 0 && (
                  <ul className="mt-4 space-y-2 border-t border-slate-200/80 pt-4 text-xs leading-relaxed text-slate-600">
                    {pos.responsibilities.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {pos.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {pos.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Source: {pos.verified_source}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Academic Credentials */}
        <div className="lg:col-span-5">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600">
              <GraduationCap className="h-4 w-4" />
            </span>
            <h3 className="font-display text-xl font-bold text-slate-950">Academic Credentials</h3>
          </div>

          <div className="space-y-5">
            {verifiedEducation.map((edu) => (
              <article key={edu.id} className="glass-panel rounded-3xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[11px] text-blue-700">
                    {edu.year}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-700">
                      {edu.status}
                    </span>
                    {edu.cgpa && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-800">
                        CGPA {edu.cgpa}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="mt-3 font-display text-lg font-bold text-slate-950">{edu.degree}</h4>
                <p className="mt-1 text-xs font-medium text-amber-700">{edu.institution}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-700">{edu.focus}</p>

                {edu.coursework && edu.coursework.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-slate-200/80 pt-3 text-xs text-slate-600">
                    {edu.coursework.map((course) => (
                      <li key={course} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span>{course}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Certifications */}
      {verifiedCertifications.length > 0 && (
        <div className="mt-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                <Award className="h-4 w-4" />
              </span>
              <h3 className="font-display text-xl font-bold text-slate-950">
                Verified Certifications
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-700">
              {verifiedCertifications.length} Verified Badges
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {verifiedCertifications.map((cert) => {
              const badgeSrc = resolveCertificateBadge(cert.badge_path)
              return (
                <article
                  key={cert.id}
                  className="glass-panel flex flex-col justify-between rounded-3xl p-6"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      {badgeSrc ? (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
                          <img
                            src={badgeSrc}
                            alt={`${cert.name} badge`}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-600">
                          <Award className="h-7 w-7" />
                        </div>
                      )}

                      <div className="flex flex-col items-end gap-1.5 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {cert.status}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          Issued {cert.issue_date}
                        </span>
                      </div>
                    </div>

                    <h4 className="mt-4 font-display text-lg font-bold text-slate-950">{cert.name}</h4>
                    <p className="mt-1 font-mono text-xs text-blue-700">{cert.issuer}</p>

                    {cert.skills_covered.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {cert.skills_covered.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {cert.credential_url && (
                    <div className="mt-5 border-t border-slate-200/80 pt-4">
                      <a
                        href={cert.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-blue-600 transition hover:text-blue-800"
                      >
                        <span>Verify Credential</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}

      {/* Courses / Continuous Training, Verified Achievements & Languages */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Verified Courses & Continuous Training */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-5">
          <div className="mb-4 flex items-center gap-2.5">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h3 className="font-display text-lg font-bold text-slate-950">
              Verified Programs &amp; Continuous Training
            </h3>
          </div>

          <div className="space-y-4">
            {verifiedCourses.map((course) => (
              <div
                key={course.id}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-amber-700">{course.issuer}</span>
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] text-blue-700">
                    {course.status}
                  </span>
                </div>
                <h4 className="mt-1.5 font-display text-base font-semibold text-slate-950">
                  {course.name}
                </h4>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.skills_covered.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Language Proficiencies */}
          {languages.length > 0 && (
            <div className="mt-6 border-t border-slate-200/80 pt-5">
              <div className="mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-600" />
                <h4 className="font-display text-base font-bold text-slate-950">
                  Language Proficiencies
                </h4>
              </div>
              <div className="space-y-2.5">
                {languages.map((lang) => (
                  <div
                    key={lang.language}
                    className="flex flex-col gap-0.5 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-display text-sm font-semibold text-slate-950">
                      {lang.language}
                    </span>
                    <span className="font-mono text-[11px] text-slate-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verified Achievements */}
        <div className="glass-panel rounded-3xl p-6 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Trophy className="h-4 w-4 text-amber-600" />
              <h3 className="font-display text-lg font-bold text-slate-950">
                Verified Engineering Milestones &amp; Achievements
              </h3>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              {verifiedAchievements.length} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {verifiedAchievements.map((ach) => (
              <article
                key={ach.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/90 p-4 transition hover:border-amber-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-800">
                      {ach.category}
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <h4 className="mt-3 font-display text-base font-semibold text-slate-950">
                    {ach.title}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{ach.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
