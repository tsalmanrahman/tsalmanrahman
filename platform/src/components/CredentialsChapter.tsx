import React, { useMemo } from 'react'
import { Award, BookOpen, CheckCircle2, ExternalLink, GraduationCap, ShieldCheck, Trophy } from 'lucide-react'
import type { AchievementItem, CertificationItem } from '../types/ecosystem'

interface CredentialsChapterProps {
  certifications: CertificationItem[]
  achievements: AchievementItem[]
  credlyUrl: string
}

function resolveCertificateBadge(badgePath: string): string | null {
  const trimmed = badgePath.trim()
  if (!trimmed) return null
  const basename = trimmed.split('/').pop()
  return basename ? `./assets/certificates/${basename}` : null
}

export const CredentialsChapter: React.FC<CredentialsChapterProps> = ({
  certifications,
  achievements,
  credlyUrl,
}) => {
  const verifiedCerts = useMemo(
    () => certifications.filter((c) => c.verified && c.category === 'certification'),
    [certifications],
  )
  const verifiedCourses = useMemo(
    () => certifications.filter((c) => c.verified && c.category === 'course'),
    [certifications],
  )
  const verifiedAchievements = useMemo(
    () => achievements.filter((a) => a.verified),
    [achievements],
  )

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {/* SECTION C: MY CERTIFICATIONS */}
      <section
        id="certifications"
        data-chapter="certifications"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              03 / 09 — MY CERTIFICATIONS
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Third-party verified certifications &amp; credentials.
            </h2>
          </div>

          <a
            href={credlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-mono text-xs font-semibold text-emerald-800 transition hover:border-emerald-400"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Credly Verification Profile</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Clickable Certification Cards with Visual Certificate Images */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {verifiedCerts.map((cert) => {
            const badgeSrc = resolveCertificateBadge(cert.badge_path)
            return (
              <article
                key={cert.id}
                className="editorial-surface flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <a
                      href={cert.credential_url || credlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xs transition hover:border-blue-400"
                    >
                      {badgeSrc ? (
                        <img
                          src={badgeSrc}
                          alt={`${cert.name} certificate badge`}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Award className="h-8 w-8 text-emerald-600" />
                      )}
                    </a>

                    <div className="flex flex-col items-end gap-1.5 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {cert.status}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Issued {cert.issue_date}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 font-editorial text-2xl italic leading-snug text-slate-950">
                    {cert.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs font-medium text-blue-700">{cert.issuer}</p>

                  {cert.credential_id && (
                    <p className="mt-2 truncate font-mono text-[10px] text-slate-500">
                      ID: {cert.credential_id}
                    </p>
                  )}

                  {cert.skills_covered.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cert.skills_covered.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {cert.credential_url && (
                  <div className="mt-6 border-t border-slate-200/80 pt-4">
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-blue-700 transition hover:text-blue-900"
                    >
                      <span>Verify Authentic Credential</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Continuous Learning & PGDDS Training Track */}
        {verifiedCourses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
            {verifiedCourses.map((course) => (
              <div
                key={course.id}
                className="editorial-surface flex flex-col justify-between rounded-2xl p-5"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-amber-700">
                      <BookOpen className="h-3.5 w-3.5 text-amber-600" />
                      {course.issuer}
                    </span>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[10px] text-blue-700">
                      {course.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-slate-950">
                    {course.name}
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {course.skills_covered.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="hairline-divider" />

      {/* SECTION D: MY BADGES & ACHIEVEMENTS */}
      <section
        id="badges"
        data-chapter="badges"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              04 / 09 — MY BADGES &amp; ACHIEVEMENTS
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Visual badge showcase &amp; engineering milestones.
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-600">
            Official verified platform emblems from IBM, Google, and Microsoft alongside audited
            academic and production milestones.
          </p>
        </div>

        {/* Visual Platform Badges Row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {verifiedCerts.map((cert) => {
            const badgeSrc = resolveCertificateBadge(cert.badge_path)
            return (
              <a
                key={`badge-${cert.id}`}
                href={cert.credential_url || credlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-surface group flex flex-col items-center justify-between rounded-3xl p-6 text-center"
              >
                <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition group-hover:border-blue-200 group-hover:bg-white">
                  {badgeSrc ? (
                    <img
                      src={badgeSrc}
                      alt={`${cert.issuer} — ${cert.name}`}
                      className="h-24 w-24 object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <Award className="h-12 w-12 text-blue-600" />
                  )}
                </div>
                <div className="mt-4 w-full">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-blue-700">
                    {cert.issuer}
                  </div>
                  <h3 className="mt-1 font-display text-sm font-bold text-slate-950">
                    {cert.name}
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>{cert.issue_date}</span>
                  </div>
                </div>
              </a>
            )
          })}

          {/* UIU PGDDS Academic Distinction Visual Emblem */}
          <div className="editorial-surface flex flex-col items-center justify-between rounded-3xl p-6 text-center">
            <div className="flex h-32 w-full flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <GraduationCap className="h-10 w-10 text-amber-700" />
              <div className="mt-2 font-editorial text-3xl italic leading-none text-slate-950">
                3.56 / 4.00
              </div>
            </div>
            <div className="mt-4 w-full">
              <div className="font-mono text-[10px] uppercase tracking-wider text-amber-700">
                UIU &amp; BITM
              </div>
              <h3 className="mt-1 font-display text-sm font-bold text-slate-950">
                Post Graduate Diploma in Data Science
              </h3>
              <div className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-slate-600">
                <span>PGDDS 102 (A) · PGDDS 103 (A)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Achievements Grid */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {verifiedAchievements.map((ach) => (
            <article
              key={ach.id}
              className="editorial-surface flex flex-col justify-between rounded-2xl p-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                    <Trophy className="h-3 w-3 text-amber-600" />
                    {ach.category}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <h3 className="mt-3 font-editorial text-2xl italic text-slate-950">
                  {ach.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{ach.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
