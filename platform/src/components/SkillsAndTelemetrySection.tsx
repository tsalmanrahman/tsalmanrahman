import React, { useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Code2,
  Compass,
  Cpu,
  Database,
  Layers,
  MessageSquareQuote,
  ServerCog,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type {
  GitHubMetrics,
  ProfileApproachPillar,
  Recommendation,
  SkillEntry,
  SkillsCatalog,
} from '../types/ecosystem'

export interface SkillsAndTelemetrySectionProps {
  skills: SkillsCatalog
  githubMetrics: GitHubMetrics
  pillars: ProfileApproachPillar[]
  recommendations: Recommendation[]
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

const LANGUAGE_COLOR_MAP: Record<string, string> = {
  HTML: '#E34C26',
  'C#': '#512BD4',
  Python: '#3776AB',
  JavaScript: '#F7DF1E',
  TSQL: '#CC2927',
  CSS: '#264DE4',
  PowerShell: '#0284C7',
  Dockerfile: '#2496ED',
  TypeScript: '#3178C6',
}

function formatByteUnit(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${bytes.toLocaleString('en-US')} B`
}

function formatUtcTimestamp(iso: string): string {
  if (!iso) return 'Unavailable'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return `${date.toISOString().replace('T', ' ').slice(0, 19)} UTC`
}

function getPillarIcon(index: number): React.ComponentType<{ className?: string }> {
  const icons = [ShieldCheck, BarChart3, Cpu, ServerCog]
  return icons[index % icons.length]
}

export const SkillsAndTelemetrySection: React.FC<SkillsAndTelemetrySectionProps> = ({
  skills,
  githubMetrics,
  pillars,
  recommendations,
}) => {
  const [activeCategory, setActiveCategory] = useState<'All' | SkillCategoryKey>('All')

  const totalSkillsCount = useMemo(
    () =>
      SKILL_CATEGORIES.reduce(
        (acc, category) => acc + (skills[category.key]?.length ?? 0),
        0,
      ),
    [skills],
  )

  const visibleCategories = useMemo(() => {
    if (activeCategory === 'All') {
      return SKILL_CATEGORIES
    }
    return SKILL_CATEGORIES.filter((cat) => cat.key === activeCategory)
  }, [activeCategory])

  const languageTelemetry = useMemo(() => {
    const entries = Object.entries(githubMetrics.language_bytes ?? {})
      .filter(([, bytes]) => typeof bytes === 'number' && bytes > 0)
      .sort((a, b) => b[1] - a[1])

    const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0)

    return {
      totalBytes,
      items: entries.map(([language, bytes]) => {
        const share = totalBytes > 0 ? (bytes / totalBytes) * 100 : 0
        return {
          language,
          bytes,
          formatted: formatByteUnit(bytes),
          share,
          color: LANGUAGE_COLOR_MAP[language] ?? '#22D3EE',
        }
      }),
    }
  }, [githubMetrics.language_bytes])

  return (
    <section
      id="capabilities"
      className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Section Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-400">
            02 // TECHNICAL CAPABILITIES &amp; TELEMETRY
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Database Engineering, BI &amp; Codebase Stack
          </h2>
        </div>
        <p className="max-w-md text-sm text-slate-400">
          Categorized production competencies paired with live GitHub repository language telemetry
          and verified engineering endorsements.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Skill category filter"
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === 'All'}
          onClick={() => setActiveCategory('All')}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs transition cursor-pointer ${
            activeCategory === 'All'
              ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.14)]'
              : 'border-slate-800 bg-[#0B1220]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <span>All Categories</span>
          <span className="rounded-full bg-[#060A13] px-1.5 py-0.5 text-[10px] text-slate-300">
            {totalSkillsCount}
          </span>
        </button>

        {SKILL_CATEGORIES.map(({ key, label, icon: Icon }) => {
          const count = skills[key]?.length ?? 0
          const isSelected = activeCategory === key
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-xs transition cursor-pointer ${
                isSelected
                  ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.14)]'
                  : 'border-slate-800 bg-[#0B1220]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              <span className="rounded-full bg-[#060A13] px-1.5 py-0.5 text-[10px] text-slate-300">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grouped Skill Categories (No percentage bars or numeric skill ratings) */}
      <div className="space-y-6">
        {visibleCategories.map(({ key, label, icon: Icon }) => {
          const items: SkillEntry[] = skills[key] ?? []
          return (
            <div key={key} className="glass-panel rounded-3xl p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">{label}</h3>
                </div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                  {items.length} {items.length === 1 ? 'competency' : 'competencies'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((skill) => (
                  <div
                    key={`${key}-${skill.name}`}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#060A13]/85 p-4 transition hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/10"
                            style={{ backgroundColor: skill.color }}
                          />
                          <h4 className="font-display text-base font-semibold text-white">
                            {skill.name}
                          </h4>
                        </div>
                        {skill.short_code && (
                          <span
                            className="shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-slate-200"
                            style={{
                              borderColor: `${skill.color}55`,
                              backgroundColor: `${skill.color}1A`,
                            }}
                          >
                            {skill.short_code}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-cyan-300/90">
                        {skill.role}
                      </p>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-400">{skill.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Telemetry + Engineering Approach Pillars */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Codebase Language Telemetry */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-6 lg:col-span-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-cyan-400">
                  <Activity className="h-3.5 w-3.5" />
                  CODEBASE LANGUAGE TELEMETRY
                </span>
                <h3 className="mt-1.5 font-display text-xl font-bold text-white">
                  GitHub Repository Bytes
                </h3>
              </div>
              <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
                {githubMetrics.sync_status === 'live_github_api'
                  ? 'Live API Sync'
                  : githubMetrics.sync_status}
              </span>
            </div>

            {/* Total Bytes Summary */}
            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 rounded-2xl border border-slate-800 bg-[#060A13]/90 px-4 py-3">
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  Total Indexed Codebase
                </span>
                <span className="font-display text-2xl font-bold text-white">
                  {formatByteUnit(languageTelemetry.totalBytes)}
                </span>
              </div>
              <div className="text-right font-mono text-xs text-slate-300">
                <div>{languageTelemetry.totalBytes.toLocaleString('en-US')} bytes</div>
                <div className="text-[11px] text-slate-400">
                  {githubMetrics.profile.public_repos} public repos · @{githubMetrics.username}
                </div>
              </div>
            </div>

            {/* Stacked Multi-Segment Proportional Bar */}
            {languageTelemetry.totalBytes > 0 && (
              <div
                aria-label="Combined repository language byte proportions"
                className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-[#060A13] ring-1 ring-slate-800"
              >
                {languageTelemetry.items.map((item) => (
                  <div
                    key={`stack-${item.language}`}
                    title={`${item.language}: ${item.formatted} (${item.bytes.toLocaleString('en-US')} B)`}
                    style={{
                      width: `${Math.max(item.share, 0.8)}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full border-r border-[#060A13]/60 last:border-r-0"
                  />
                ))}
              </div>
            )}

            {/* Individual Horizontal Proportional Bars */}
            <div className="mt-5 space-y-3">
              {languageTelemetry.items.map((item) => (
                <div key={item.language}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-slate-200">{item.language}</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300">
                      <span>{item.formatted}</span>
                      <span className="mx-1.5 text-slate-600">·</span>
                      <span className="text-slate-400">
                        {item.bytes.toLocaleString('en-US')} B
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#060A13]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(item.share, 1.2)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3 font-mono text-[11px] text-slate-400">
            <span>Last synced UTC</span>
            <span className="text-cyan-300">{formatUtcTimestamp(githubMetrics.last_synced_utc)}</span>
          </div>
        </div>

        {/* 4 Engineering Approach Pillars (2x2 Grid) */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-6 lg:col-span-7">
          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-amber-300">
                  <Compass className="h-3.5 w-3.5" />
                  ENGINEERING METHODOLOGY
                </span>
                <h3 className="mt-1.5 font-display text-xl font-bold text-white">
                  Problem-Solving &amp; Architecture Pillars
                </h3>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {pillars.length} Core Principles
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {pillars.map((item, idx) => {
                const PillarIcon = getPillarIcon(idx)
                return (
                  <article
                    key={item.pillar}
                    className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#060A13]/85 p-5 transition hover:border-cyan-400/35"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                          <PillarIcon className="h-4 w-4" />
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">0{idx + 1}</span>
                      </div>
                      <h4 className="mt-4 font-display text-base font-bold text-white">
                        {item.pillar}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Verified LinkedIn Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-emerald-400" />
              <h3 className="font-display text-xl font-bold text-white">
                Verified LinkedIn Recommendations
              </h3>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-300">
              Direct Endorsements
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {recommendations.map((rec) => (
              <blockquote
                key={rec.id}
                className="glass-panel flex flex-col justify-between rounded-3xl p-6"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {rec.relationship}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{rec.date}</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-200">“{rec.excerpt}”</p>
                </div>

                <footer className="mt-5 border-t border-slate-800/80 pt-4">
                  <div className="font-display text-base font-semibold text-white">
                    {rec.author}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{rec.title}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Source: {rec.verified_source}
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
