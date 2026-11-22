import React from 'react'
import { Briefcase, CheckCircle2, Globe, GraduationCap, MapPin } from 'lucide-react'
import type { EducationItem, ExperiencePosition, LanguageProficiency } from '../types/ecosystem'

interface JourneyChapterProps {
  positions: ExperiencePosition[]
  education: EducationItem[]
  languages: LanguageProficiency[]
  yearsSummary: string
}

export const JourneyChapter: React.FC<JourneyChapterProps> = ({
  positions,
  education,
  languages,
  yearsSummary,
}) => {
  const verifiedEducation = education.filter((e) => e.verified)

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {/* SECTION E: MY PROFESSIONAL EXPERIENCE */}
      <section
        id="experience"
        data-chapter="experience"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              05 / 09 — MY PROFESSIONAL EXPERIENCE
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Production engineering across enterprise ERP &amp; retail databases.
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-mono text-xs text-slate-700">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <span>{yearsSummary}</span>
          </div>
        </div>

        <div className="relative space-y-6 before:absolute before:top-6 before:bottom-6 before:left-4 before:w-px before:bg-slate-200">
          {positions.map((pos) => (
            <article
              key={pos.id}
              className="editorial-surface relative ml-10 rounded-3xl p-6 sm:p-8"
            >
              {/* Timeline dot */}
              <span
                aria-hidden="true"
                className={`absolute top-8 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border bg-white ${
                  pos.current ? 'border-emerald-500' : 'border-blue-500'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    pos.current ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                />
              </span>

              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-700">
                      {pos.organization}
                    </span>
                    {pos.current && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase text-emerald-800">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Current Role
                      </span>
                    )}
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                      {pos.work_mode}
                    </span>
                  </div>

                  <h3 className="mt-2 font-editorial text-3xl italic leading-tight text-slate-950">
                    {pos.role}
                  </h3>
                </div>

                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 font-mono text-xs font-medium text-blue-800">
                    {pos.period}
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-500">
                    <MapPin className="h-3 w-3 text-blue-600" />
                    {pos.location}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed font-medium text-slate-800 sm:text-[15px]">
                {pos.summary}
              </p>

              {pos.responsibilities.length > 0 && (
                <ul className="mt-4 grid grid-cols-1 gap-2.5 text-sm leading-relaxed text-slate-600 lg:grid-cols-2">
                  {pos.responsibilities.map((resp) => (
                    <li
                      key={resp}
                      className="flex items-start gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs sm:text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {pos.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-mono text-[11px] text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Source: {pos.verified_source}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="hairline-divider" />

      {/* SECTION F: MY EDUCATION */}
      <section
        id="education"
        data-chapter="education"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-4 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              06 / 09 — MY EDUCATION
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Academic foundations in Data Science &amp; Computer Science.
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-mono text-xs font-medium text-amber-800">
            <GraduationCap className="h-4 w-4 text-amber-600" />
            <span>UIU PGDDS (3.56) · Varendra CSE (3.12)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {verifiedEducation.map((edu) => (
            <article key={edu.id} className="editorial-surface flex flex-col justify-between rounded-3xl p-6 sm:p-8">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-xs text-blue-800">
                    {edu.year}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-800">
                      {edu.status}
                    </span>
                    {edu.cgpa && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 font-mono text-xs font-bold text-amber-900">
                        CGPA {edu.cgpa}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="mt-5 font-editorial text-3xl italic leading-snug text-slate-950">
                  {edu.degree}
                </h3>
                <p className="mt-1 font-mono text-xs font-semibold text-amber-700">
                  {edu.institution}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{edu.focus}</p>
              </div>

              {edu.coursework && edu.coursework.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-slate-200/80 pt-4 text-xs text-slate-600 sm:text-sm">
                  {edu.coursework.map((course) => (
                    <li key={course} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>

        {/* Verified Language Proficiencies */}
        {languages.length > 0 && (
          <div className="mt-8 editorial-surface rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-600" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-700">
                Verified Language Proficiencies
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {languages.map((lang) => (
                <div
                  key={lang.language}
                  className="flex flex-col justify-between gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <span className="font-editorial text-2xl italic text-slate-950">
                    {lang.language}
                  </span>
                  <span className="font-mono text-xs text-slate-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
