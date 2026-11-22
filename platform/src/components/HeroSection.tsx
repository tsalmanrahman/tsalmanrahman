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
      accent: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
    },
    {
      label: 'FREE & OPEN AI SKILLS',
      value: String(skillCount),
      sub: 'Security-audited · Zero paid traps',
      icon: Sparkles,
      accent: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
    },
    {
      label: 'AGENT INTEGRATIONS',
      value: String(agentCount),
      sub: 'OpenCode · Antigravity · Ollama · Copilot',
      icon: Cpu,
      accent: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10',
    },
    {
      label: 'VERIFIED CREDENTIALS',
      value: String(verifiedCertCount),
      sub: 'IBM SQL · Google IT · Microsoft C#',
      icon: Database,
      accent: 'text-sky-300 border-sky-400/30 bg-sky-400/10',
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
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/35 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {career.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-[#0B1220]/90 px-3 py-1 font-mono text-[11px] text-slate-300">
              <MapPin className="h-3 w-3 text-cyan-400" />
              {profile.location}
            </span>
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-[11px] text-cyan-200 transition hover:border-cyan-300 cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              Verified LinkedIn Source
            </button>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300/90">
              {profile.organization} · ENTERPRISE DATA &amp; AI HUB
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {profile.name}
            </h1>
            <p className="max-w-2xl font-display text-lg font-medium leading-snug text-cyan-100/90 sm:text-xl">
              {profile.headline}
            </p>
          </div>

          <div className="space-y-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            <p>{profile.short_bio}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.banner.pills.map((pill) => (
              <span
                key={pill}
                className="rounded-lg border border-slate-800 bg-[#0B1220]/85 px-3 py-1.5 font-mono text-xs text-slate-300"
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
              <Briefcase className="h-4 w-4 text-cyan-300" />
              LinkedIn
              <ExternalLink className="h-3.5 w-3.5" />
            </MagneticButton>
            <MagneticButton href={profile.contact.github} target="_blank" variant="ghost">
              <FolderGit2 className="h-4 w-4" />
              GitHub
            </MagneticButton>
          </div>
        </div>

        {/* Right: Genuine Identity-Locked Studio Portrait Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel relative mx-auto max-w-md overflow-hidden rounded-3xl p-5 shadow-[0_24px_80px_rgba(6,10,19,0.85)]">
            <div className="mb-3 flex items-center justify-between font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                IDENTITY LOCK ACTIVE
              </span>
              <span className="text-slate-400">SHA256:{identityLock.sha256.slice(0, 10)}</span>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-[#080E1A]">
              <img
                src="./assets/identity/salman-rahman-portrait.jpg"
                alt="Salman Rahman — Verified Studio Headshot"
                className="aspect-[4/4.2] w-full object-cover object-top"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060A13]/85 via-transparent to-transparent"
              />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 rounded-xl border border-slate-700/70 bg-[#060A13]/85 px-3.5 py-2.5 backdrop-blur-md">
                <div>
                  <p className="font-display text-sm font-semibold text-white">{profile.name}</p>
                  <p className="font-mono text-[11px] text-cyan-300">
                    Executive (IT &amp; MIS) · SQL &amp; ERP
                  </p>
                </div>
                <span className="rounded-md border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
                  UNALTERED PHOTO
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-800/90 bg-[#060A13]/75 px-3.5 py-2.5 text-xs text-slate-400">
              <span className="truncate font-mono text-[11px]">
                Ref: {identityLock.primary_reference.replace('https://www.', '')}
              </span>
              <button
                type="button"
                onClick={onOpenVerificationModal}
                className="shrink-0 font-mono text-[11px] text-cyan-300 hover:text-cyan-200 cursor-pointer"
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
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                  {kpi.label}
                </span>
                <span className={`inline-flex rounded-lg border p-2 ${kpi.accent}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-bold text-white">{kpi.value}</div>
              <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
