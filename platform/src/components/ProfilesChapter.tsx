import React, { useMemo } from 'react'
import {
  Activity,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  GitFork,
  MessageSquareQuote,
  ShieldCheck,
  Star,
} from 'lucide-react'
import type { GitHubMetrics, ProfileData, Recommendation } from '../types/ecosystem'

interface ProfilesChapterProps {
  profile: ProfileData
  recommendations: Recommendation[]
  githubMetrics: GitHubMetrics
  lastVerifiedDate: string
  onOpenVerificationModal: () => void
}

const LANGUAGE_COLOR_MAP: Record<string, string> = {
  HTML: '#E34C26',
  'C#': '#512BD4',
  Python: '#3776AB',
  JavaScript: '#EAB308',
  TSQL: '#CC2927',
  CSS: '#264DE4',
  PowerShell: '#0284C7',
  Dockerfile: '#2496ED',
  TypeScript: '#3178C6',
}

function formatByteUnit(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${bytes.toLocaleString('en-US')} B`
}

function formatUtcDate(iso: string): string {
  if (!iso) return 'Unavailable'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return `${d.toISOString().slice(0, 10)}`
}

export const ProfilesChapter: React.FC<ProfilesChapterProps> = ({
  profile,
  recommendations,
  githubMetrics,
  lastVerifiedDate,
  onOpenVerificationModal,
}) => {
  const languageTelemetry = useMemo(() => {
    const entries = Object.entries(githubMetrics.language_bytes ?? {})
      .filter(([, bytes]) => typeof bytes === 'number' && bytes > 0)
      .sort((a, b) => b[1] - a[1])

    const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0)
    return {
      totalBytes,
      items: entries.map(([language, bytes]) => ({
        language,
        bytes,
        formatted: formatByteUnit(bytes),
        share: totalBytes > 0 ? (bytes / totalBytes) * 100 : 0,
        color: LANGUAGE_COLOR_MAP[language] ?? '#0284C7',
      })),
    }
  }, [githubMetrics.language_bytes])

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
      {/* SECTION G: MY LINKEDIN & ENDORSEMENTS */}
      <section
        id="linkedin"
        data-chapter="linkedin"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              07 / 09 — MY LINKEDIN &amp; ENDORSEMENTS
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Primary source of truth &amp; professional endorsements.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 py-2.5 text-xs font-medium text-white transition hover:border-blue-600 hover:bg-blue-600"
            >
              <Briefcase className="h-4 w-4" />
              <span>View Live LinkedIn Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 font-mono text-xs font-semibold text-emerald-800 transition hover:border-emerald-400 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Audit Ledger ({lastVerifiedDate})</span>
            </button>
          </div>
        </div>

        {/* LinkedIn Identity Banner + Recommendations */}
        <div className="editorial-surface mb-8 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Verified LinkedIn Identity · /in/t-salmanrahman
              </div>
              <h3 className="mt-2 font-editorial text-2xl italic text-slate-950 sm:text-3xl">
                {profile.headline}
              </h3>
              <p className="mt-2 font-mono text-xs text-slate-500">
                Current Organization: {profile.organization} · Location: {profile.location}
              </p>
            </div>

            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 font-mono text-xs font-semibold text-blue-800 transition hover:border-blue-400"
            >
              <span>linkedin.com/in/t-salmanrahman</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {recommendations.map((rec) => (
              <blockquote
                key={rec.id}
                className="editorial-surface flex flex-col justify-between rounded-3xl p-6 sm:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-medium text-emerald-800">
                      <MessageSquareQuote className="h-3.5 w-3.5 text-emerald-600" />
                      {rec.relationship}
                    </span>
                    <span className="font-mono text-xs text-slate-500">{rec.date}</span>
                  </div>
                  <p className="mt-5 font-editorial text-2xl italic leading-relaxed text-slate-900 sm:text-[26px]">
                    “{rec.excerpt}”
                  </p>
                </div>

                <footer className="mt-6 border-t border-slate-200/80 pt-4">
                  <div className="font-display text-base font-bold text-slate-950">{rec.author}</div>
                  <div className="mt-0.5 text-xs text-slate-600">{rec.title}</div>
                  <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                    {rec.verified_source}
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      <div className="hairline-divider" />

      {/* SECTION H: MY GITHUB & CODEBASE TELEMETRY */}
      <section
        id="github"
        data-chapter="github"
        className="chapter-reveal relative z-10 scroll-mt-14 py-16 lg:py-24"
      >
        <div className="mb-10 flex flex-col gap-5 border-b border-slate-200/90 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              08 / 09 — MY GITHUB &amp; CODEBASE TELEMETRY
            </span>
            <h2 className="mt-3 font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Public repositories &amp; verified language telemetry.
            </h2>
          </div>

          <a
            href={profile.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 py-2.5 text-xs font-medium text-white transition hover:border-blue-600 hover:bg-blue-600"
          >
            <FolderGit2 className="h-4 w-4" />
            <span>github.com/{githubMetrics.username}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Codebase Language Byte Telemetry */}
          <div className="editorial-surface flex flex-col justify-between rounded-3xl p-6 sm:p-8 lg:col-span-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-blue-600">
                  <Activity className="h-3.5 w-3.5" />
                  LIVE CODEBASE DISTRIBUTION
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-800">
                  {githubMetrics.sync_status === 'live_github_api'
                    ? 'Live GitHub API Sync'
                    : githubMetrics.sync_status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5">
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Total Indexed Codebase
                  </span>
                  <span className="font-editorial text-4xl italic text-slate-950">
                    {formatByteUnit(languageTelemetry.totalBytes)}
                  </span>
                </div>
                <div className="text-right font-mono text-xs text-slate-600">
                  <div>{languageTelemetry.totalBytes.toLocaleString('en-US')} bytes</div>
                  <div className="text-[11px] text-slate-500">
                    {githubMetrics.profile.public_repos} public repos · since{' '}
                    {githubMetrics.profile.created_year}
                  </div>
                </div>
              </div>

              {/* Multi-segment bar (flat solid segments, ZERO gradients) */}
              {languageTelemetry.totalBytes > 0 && (
                <div
                  aria-label="Combined repository language byte proportions"
                  className="mt-5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
                >
                  {languageTelemetry.items.map((item) => (
                    <div
                      key={`bar-${item.language}`}
                      title={`${item.language}: ${item.formatted}`}
                      style={{
                        width: `${Math.max(item.share, 0.8)}%`,
                        backgroundColor: item.color,
                      }}
                      className="h-full border-r border-white last:border-r-0"
                    />
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-3">
                {languageTelemetry.items.map((item) => (
                  <div key={item.language}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.language}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600">
                        {item.formatted} ({item.share.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(item.share, 1.5)}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-200/80 pt-3 font-mono text-[11px] text-slate-500">
              Last Synced UTC: <span className="text-blue-700">{githubMetrics.last_synced_utc}</span>
            </div>
          </div>

          {/* Public Repositories Panel */}
          <div className="editorial-surface flex flex-col justify-between rounded-3xl p-6 sm:p-8 lg:col-span-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-700">
                  FEATURED GITHUB REPOSITORIES
                </span>
                <span className="font-mono text-xs text-slate-500">
                  @{githubMetrics.username}
                </span>
              </div>

              <div className="mt-5 space-y-3.5">
                {githubMetrics.repositories.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/75 p-4 transition hover:border-blue-400 hover:bg-white sm:flex-row sm:items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="h-4 w-4 text-blue-600" />
                        <span className="font-editorial text-2xl italic text-slate-950 group-hover:text-blue-700">
                          {repo.name}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                LANGUAGE_COLOR_MAP[repo.primary_language] ?? '#2563EB',
                            }}
                          />
                          {repo.primary_language}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3" /> {repo.stars}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="h-3 w-3" /> {repo.forks}
                        </span>
                        <span>Updated {formatUtcDate(repo.updated_at)}</span>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-blue-700">
                      <span>Open</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                ))}

                <a
                  href={`${profile.contact.github}/${githubMetrics.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/75 p-4 transition hover:border-blue-400 hover:bg-white sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-amber-600" />
                      <span className="font-editorial text-2xl italic text-slate-950 group-hover:text-blue-700">
                        {githubMetrics.username} (This Unified Ecosystem)
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      JSON Source-of-Truth + AI Skills Hub + TypeScript/Three.js Web Platform
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs font-semibold text-blue-700">
                    <span>Open</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </span>
                </a>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
              All language byte counts above are aggregated automatically across verified public
              repositories by{' '}
              <code className="rounded bg-white px-1.5 py-0.5 font-mono text-blue-700">
                scripts/fetch_github_data.py
              </code>
              .
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
