import React from 'react'
import {
  ArrowDownRight,
  Briefcase,
  Cpu,
  Database,
  ExternalLink,
  FolderGit2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import type {
  CareerData,
  CertificationItem,
  GitHubMetrics,
  IdentityLockManifest,
  ProfileData,
} from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'
import type { ViewMode } from './NavigationDock'

interface HeroSectionProps {
  profile: ProfileData
  career: CareerData
  githubMetrics: GitHubMetrics
  identityLock: IdentityLockManifest
  certifications: CertificationItem[]
  skillCount: number
  agentCount: number
  onJump: (mode: ViewMode, anchorId: string) => void
  onOpenVerificationModal: () => void
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  career,
  githubMetrics,
  identityLock,
  certifications,
  skillCount,
  agentCount,
  onJump,
  onOpenVerificationModal,
}) => {
  const verifiedCertCount = certifications.filter(
    (c) => c.verified && c.category === 'certification',
  ).length

  const kpis = [
    {
      label: 'VERIFIED GITHUB REPOS',
      value: String(githubMetrics.profile.public_repos),
      sub: `Since ${githubMetrics.profile.created_year} · ${profile.organization}`,
      icon: FolderGit2,
      accent: 'text-blue-700 border-blue-200 bg-blue-50',
    },
    {
      label: 'FREE & OPEN AI SKILLS',
      value: String(skillCount),
      sub: 'Security-audited · Zero paid traps',
      icon: Sparkles,
      accent: 'text-amber-700 border-amber-200 bg-amber-50',
    },
    {
      label: 'AGENT INTEGRATIONS',
      value: String(agentCount),
      sub: 'OpenCode · Antigravity · Ollama · Copilot',
      icon: Cpu,
      accent: 'text-emerald-700 border-emerald-200 bg-emerald-50',
    },
    {
      label: 'VERIFIED CREDENTIALS',
      value: String(verifiedCertCount),
      sub: 'IBM SQL · Google IT · Microsoft C#',
      icon: Database,
      accent: 'text-sky-700 border-sky-200 bg-sky-50',
    },
  ]

  return (
    <section
      id="hero"
      className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:px-8 lg:pb-24"
    >
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Left: Editorial Identity & Positioning */}
        <div className="space-y-6 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {career.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[11px] text-slate-700 shadow-2xs">
              <MapPin className="h-3 w-3 text-blue-600" />
              {profile.location}
            </span>
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[11px] font-medium text-blue-700 transition hover:border-blue-400 hover:bg-blue-100/70 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Verified LinkedIn Source
            </button>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              {profile.organization} · ENTERPRISE DATA &amp; AI HUB
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="max-w-2xl font-display text-lg font-medium leading-snug text-blue-800 sm:text-xl">
              {profile.headline}
            </p>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            <p>{profile.short_bio}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.banner.pills.map((pill) => (
              <span
                key={pill}
                className="rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 font-mono text-xs text-slate-700 shadow-2xs"
              >
                {pill}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <MagneticButton
              variant="primary"
              onClick={() => onJump('portfolio', 'projects')}
            >
              Explore Engineering Systems
              <ArrowDownRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton
              variant="secondary"
              onClick={() => onJump('skills', 'skills-hub')}
            >
              <Sparkles className="h-4 w-4" />
              Open AI Skills Hub ({skillCount})
            </MagneticButton>
            <MagneticButton href={profile.contact.linkedin} target="_blank" variant="ghost">
              <Briefcase className="h-4 w-4 text-blue-600" />
              LinkedIn
              <ExternalLink className="h-3.5 w-3.5" />
            </MagneticButton>
            <MagneticButton href={profile.contact.github} target="_blank" variant="ghost">
              <FolderGit2 className="h-4 w-4 text-slate-700" />
              GitHub
            </MagneticButton>
          </div>
        </div>

        {/* Right: Genuine Identity-Locked Studio Portrait Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel relative mx-auto max-w-md overflow-hidden rounded-3xl p-5">
            <div className="mb-3 flex items-center justify-between font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                IDENTITY LOCK ACTIVE
              </span>
              <span className="text-slate-500">SHA256:{identityLock.sha256.slice(0, 10)}</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src="./assets/identity/salman-rahman-portrait.jpg"
                alt="Salman Rahman — Verified Studio Headshot"
                className="aspect-[4/4.2] w-full object-cover object-top"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent"
              />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 rounded-xl border border-slate-200/90 bg-white/92 px-3.5 py-2.5 shadow-sm backdrop-blur-md">
                <div>
                  <p className="font-display text-sm font-bold text-slate-950">{profile.name}</p>
                  <p className="font-mono text-[11px] font-medium text-blue-700">
                    Executive (IT &amp; MIS) · SQL &amp; ERP
                  </p>
                </div>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                  UNALTERED PHOTO
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-2.5 text-xs text-slate-600">
              <span className="truncate font-mono text-[11px]">
                Ref: {identityLock.primary_reference.replace('https://www.', '')}
              </span>
              <button
                type="button"
                onClick={onOpenVerificationModal}
                className="shrink-0 font-mono text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Audit Log →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live HUD Telemetry KPI Strip */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="glass-panel rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                  {kpi.label}
                </span>
                <span className={`inline-flex rounded-lg border p-2 ${kpi.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold text-slate-950">{kpi.value}</div>
              <p className="mt-1 text-xs text-slate-600">{kpi.sub}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
