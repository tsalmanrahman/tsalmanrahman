import React, { useMemo, useState } from 'react'
import { BarChart3, Code2, Compass, Cpu, Database, Layers, ServerCog, ShieldCheck, Wrench } from 'lucide-react'
import type { CareerData, ProfileData, SkillEntry, SkillsCatalog } from '../types/ecosystem'

interface AboutChapterProps {
  profile: ProfileData
  career: CareerData
  skills: SkillsCatalog
  onNavigateChapter: (chapterId: string) => void
}

type SkillCategoryKey = keyof SkillsCatalog

const SKILL_CATEGORIES: Array<{
  key: SkillCategoryKey
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { key: 'Database', label: 'Database', icon: Database },
  { key: 'Programming', label: 'Programming', icon: Code2 },
  { key: 'Reporting', label: 'Reporting', icon: BarChart3 },
  { key: 'IT Support', label: 'IT Support', icon: Wrench },
  { key: 'Other', label: 'Other', icon: Layers },
]

function getPillarIcon(index: number): React.ComponentType<{ className?: string }> {
  const icons = [ShieldCheck, BarChart3, Cpu, ServerCog]
  return icons[index % icons.length]
}

export const AboutChapter: React.FC<AboutChapterProps> = ({
  profile,
  career,
  skills,
  onNavigateChapter,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | SkillCategoryKey>('All')

  const totalSkillsCount = useMemo(
    () => SKILL_CATEGORIES.reduce((acc, cat) => acc + (skills[cat.key]?.length ?? 0), 0),
    [skills],
  )

  const visibleCategories = useMemo(
    () =>
      activeCategory === 'All'
        ? SKILL_CATEGORIES
        : SKILL_CATEGORIES.filter((cat) => cat.key === activeCategory),
    [activeCategory],
  )

  return (
    <section
      id="about"
      data-chapter="about"
      className="chapter-reveal relative z-10 mx-auto max-w-[1440px] scroll-mt-14 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Chapter Header */}
      <div className="mb-12 grid grid-cols-1 gap-8 border-b border-slate-200/90 pb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            01 / 09 — ABOUT ME
          </span>
          <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Designing dependable SQL Server architectures &amp; enterprise data clarity.
          </h2>
        </div>
        <div className="lg:col-span-5 lg:text-right">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
            {profile.location} · {profile.organization}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Grounded in Computer Science (B.Sc. CSE), Data Science (UIU PGDDS · 3.56), and daily
            production ERP &amp; POS operations.
          </p>
        </div>
      </div>

      {/* Narrative + Vadim-Style 2-Column Metadata Facts */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-6">
          {profile.summary.map((paragraph, idx) => (
            <p
              key={paragraph}
              className={
                idx === 0
                  ? 'text-base leading-relaxed font-medium text-slate-900 sm:text-lg'
                  : 'text-sm leading-relaxed text-slate-600 sm:text-[15px]'
              }
            >
              {paragraph}
            </p>
          ))}

          {/* Problem-Solving & Engineering Pillars */}
          <div className="pt-4">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-amber-700">
              <Compass className="h-3.5 w-3.5 text-amber-600" />
              <span>ENGINEERING PHILOSOPHY</span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {profile.problem_solving_approach.map((item, idx) => {
                const Icon = getPillarIcon(idx)
                return (
                  <article
                    key={item.pillar}
                    className="editorial-surface rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                    </div>
                    <h3 className="mt-3 font-display text-sm font-bold text-slate-950">
                      {item.pillar}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Editorial Facts & Goals Grid */}
        <div className="lg:col-span-6">
          <div className="editorial-surface rounded-3xl p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Target Roles &amp; Direction
                </h3>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {career.career_interests.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[11px] font-medium text-blue-800"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Availability Status
                </h3>
                <p className="mt-2 font-editorial text-2xl italic text-slate-950">
                  {career.status}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateChapter('contact')}
                  className="mt-1 font-mono text-xs font-semibold text-blue-600 underline underline-offset-4 hover:text-blue-800 cursor-pointer"
                >
                  Connect directly →
                </button>
              </div>

              <div className="sm:col-span-2 border-t border-slate-200/80 pt-5">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Current Technical Focus &amp; Goals
                </h3>
                <ul className="mt-3 space-y-2">
                  {career.current_focus.map((focus) => (
                    <li
                      key={focus}
                      className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700 sm:text-sm"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="sm:col-span-2 border-t border-slate-200/80 pt-5">
                <h3 className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
                  Recent Verified Milestones
                </h3>
                <div className="mt-3 space-y-3">
                  {career.recent_updates.map((upd) => (
                    <div
                      key={`${upd.date}-${upd.category}`}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5"
                    >
                      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider">
                        <span className="font-semibold text-blue-700">{upd.category}</span>
                        <span className="text-slate-500">{upd.date}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-700">{upd.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categorized Technical Expertise Matrix (Zero percentages per AGENTS.md) */}
      <div className="mt-14 border-t border-slate-200/80 pt-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              CORE TECHNICAL COMPETENCIES
            </span>
            <h3 className="mt-1 font-editorial text-3xl italic text-slate-950 sm:text-4xl">
              Production Stack &amp; Operational Tooling
            </h3>
          </div>

          <div
            role="tablist"
            aria-label="Technical skill category filter"
            className="flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'All'}
              onClick={() => setActiveCategory('All')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition cursor-pointer ${
                activeCategory === 'All'
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80">{totalSkillsCount}</span>
            </button>
            {SKILL_CATEGORIES.map(({ key, label }) => {
              const isSelected = activeCategory === key
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs transition cursor-pointer ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] opacity-80">{skills[key]?.length ?? 0}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          {visibleCategories.map(({ key, label, icon: Icon }) => {
            const items: SkillEntry[] = skills[key] ?? []
            return (
              <div key={key} className="editorial-surface rounded-3xl p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h4 className="font-display text-base font-bold text-slate-950">{label}</h4>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                    {items.length} {items.length === 1 ? 'skill' : 'skills'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((skill) => (
                    <div
                      key={`${key}-${skill.name}`}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/75 p-4 transition hover:border-blue-300"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: skill.color }}
                            />
                            <h5 className="font-display text-sm font-bold text-slate-950">
                              {skill.name}
                            </h5>
                          </div>
                          {skill.short_code && (
                            <span className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                              {skill.short_code}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-blue-700">
                          {skill.role}
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{skill.focus}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
