import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Filter,
  GitBranch,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import type {
  AiAgentEntry,
  AiAgentsRoster,
  AiSkillEntry,
  AiSkillsRegistry,
  PricingTier,
} from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'

interface AiSkillsHubSectionProps {
  registry: AiSkillsRegistry
  agentsRoster: AiAgentsRoster
  selectedSkill: AiSkillEntry | null
  onSelectSkill: (skill: AiSkillEntry | null) => void
}

const PRICING_BADGE: Record<PricingTier, { label: string; classes: string }> = {
  'free-open-source': {
    label: 'Free & Open Source',
    classes: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-300',
  },
  'free-tier-limited': {
    label: 'Free Tier (Quota-Limited)',
    classes: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-300',
  },
  freemium: {
    label: 'Freemium',
    classes: 'border-amber-400/35 bg-amber-400/10 text-amber-300',
  },
  paid: {
    label: 'Paid / Subscription',
    classes: 'border-rose-400/35 bg-rose-400/10 text-rose-300',
  },
}

export const AiSkillsHubSection: React.FC<AiSkillsHubSectionProps> = ({
  registry,
  agentsRoster,
  selectedSkill,
  onSelectSkill,
}) => {
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('All')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'repo-authored' | 'local-verified'>('all')
  const [pricingFilter, setPricingFilter] = useState<'all' | PricingTier>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const domains = useMemo(() => {
    const unique = Array.from(new Set(registry.skills.map((s) => s.domain)))
    return ['All', ...unique]
  }, [registry.skills])

  const filteredSkills = useMemo(() => {
    const q = search.trim().toLowerCase()
    return registry.skills.filter((skill) => {
      if (domainFilter !== 'All' && skill.domain !== domainFilter) return false
      if (sourceFilter !== 'all' && skill.source_type !== sourceFilter) return false
      if (pricingFilter !== 'all' && skill.pricing_tier !== pricingFilter) return false
      if (agentFilter !== 'all' && !skill.compatible_agents.includes(agentFilter)) return false
      if (!q) return true
      return (
        skill.name.toLowerCase().includes(q) ||
        skill.id.toLowerCase().includes(q) ||
        skill.domain.toLowerCase().includes(q) ||
        skill.summary.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [registry.skills, search, domainFilter, sourceFilter, pricingFilter, agentFilter])

  const agentNameById = useMemo(() => {
    const map: Record<string, AiAgentEntry> = {}
    for (const ag of agentsRoster.agents) {
      map[ag.id] = ag
    }
    return map
  }, [agentsRoster.agents])

  const handleCopyCommand = async (skill: AiSkillEntry) => {
    try {
      await navigator.clipboard.writeText(skill.install_command)
      setCopiedId(skill.id)
      window.setTimeout(() => setCopiedId((prev) => (prev === skill.id ? null : prev)), 1800)
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  }

  useEffect(() => {
    if (!selectedSkill) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSelectSkill(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedSkill, onSelectSkill])

  return (
    <section
      id="skills-hub"
      className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      {/* Header */}
      <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            04 // CENTRALIZED AI SKILLS HUB &amp; ORCHESTRATION
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Shared Free AI Skills Library &amp; Agent Ecosystem
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Unified capability layer validated by <code className="text-cyan-300">scripts/skills_hub.py</code>.
            Every skill below is inspected for supply-chain safety, deduplicated, and classified by honest pricing tier.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-center">
            <div className="font-display text-xl font-bold text-emerald-300">
              {registry.skills.length}
            </div>
            <div className="font-mono text-[10px] text-emerald-200/80">FREE &amp; OSS SKILLS</div>
          </div>
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2.5 text-center">
            <div className="font-display text-xl font-bold text-cyan-300">
              {registry.skills.filter((s) => s.source_type === 'repo-authored').length}
            </div>
            <div className="font-mono text-[10px] text-cyan-200/80">REPO FLAGSHIPS</div>
          </div>
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-center">
            <div className="font-display text-xl font-bold text-amber-300">
              {agentsRoster.agents.length}
            </div>
            <div className="font-mono text-[10px] text-amber-200/80">VERIFIED AGENTS</div>
          </div>
        </div>
      </div>

      {/* Honest Pricing Tier Classification Banner */}
      <div className="glass-panel mb-8 rounded-3xl p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Pricing Transparency &amp; Security Policy (Zero Misleading &quot;Free&quot; Labels)
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(registry.pricing_tiers_legend) as PricingTier[]).map((tier) => (
            <div
              key={tier}
              className="rounded-2xl border border-slate-800/90 bg-[#060A13]/80 p-3.5"
            >
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${PRICING_BADGE[tier].classes}`}
              >
                {PRICING_BADGE[tier].label}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                {registry.pricing_tiers_legend[tier]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Multi-Facet Filter Bar */}
      <div className="glass-panel mb-8 space-y-4 rounded-3xl p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter AI skills"
              placeholder="Search skills by name, SQL, ERP, Three.js, security, tag..."
              className="w-full rounded-xl border border-slate-700/80 bg-[#060A13] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              aria-label="Filter by Source Type"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
              className="w-full rounded-xl border border-slate-700/80 bg-[#060A13] px-3 py-2.5 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Sources ({registry.skills.length})</option>
              <option value="repo-authored">Repo-Authored (8)</option>
              <option value="local-verified">Local Audited (24)</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              aria-label="Filter by Pricing Tier"
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value as typeof pricingFilter)}
              className="w-full rounded-xl border border-slate-700/80 bg-[#060A13] px-3 py-2.5 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Pricing Tiers</option>
              <option value="free-open-source">Free &amp; Open Source</option>
              <option value="free-tier-limited">Free Tier (Limited)</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              aria-label="Filter by Compatible Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-[#060A13] px-3 py-2.5 font-mono text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
            >
              <option value="all">All Compatible Agents</option>
              {agentsRoster.agents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Filter className="h-3.5 w-3.5 text-cyan-400" />
            Domain:
          </span>
          {domains.map((domain) => {
            const active = domainFilter === domain
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setDomainFilter(domain)}
                className={`rounded-full border px-3 py-1 font-mono text-[11px] transition cursor-pointer ${
                  active
                    ? 'border-cyan-400/50 bg-cyan-400/20 text-cyan-200'
                    : 'border-slate-800 bg-[#060A13]/70 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                {domain}
              </button>
            )
          })}
          <span className="ml-auto font-mono text-[11px] text-slate-400">
            Showing <strong className="text-cyan-300">{filteredSkills.length}</strong> of{' '}
            {registry.skills.length}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <p className="font-display text-lg font-semibold text-white">
            No skills match your active filters.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Try clearing the search query or resetting pricing/domain filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setDomainFilter('All')
              setSourceFilter('all')
              setPricingFilter('all')
              setAgentFilter('all')
            }}
            className="mt-4 rounded-full border border-cyan-400/40 bg-cyan-400/15 px-4 py-1.5 font-mono text-xs text-cyan-200 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => {
            const pricing = PRICING_BADGE[skill.pricing_tier]
            return (
              <article
                key={skill.id}
                className="glass-panel flex flex-col justify-between rounded-2xl p-5 transition duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] text-cyan-200">
                      {skill.domain}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${pricing.classes}`}
                      >
                        {pricing.label}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-white">{skill.name}</h3>
                    <span className="shrink-0 font-mono text-[11px] text-slate-400">
                      v{skill.version}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-[11px] text-amber-300/90">
                    {skill.source_type === 'repo-authored' ? '★ Repo Flagship' : '✓ Local Audited'} ·{' '}
                    {skill.license}
                  </p>

                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300">{skill.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skill.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-slate-800 bg-[#060A13]/85 px-1.5 py-0.5 font-mono text-[10px] text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-800/80 pt-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {skill.compatible_agents.map((agId) => (
                      <span
                        key={agId}
                        className="rounded-full border border-slate-700/80 bg-slate-900/75 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                      >
                        {agentNameById[agId]?.name ?? agId}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Audit: {skill.security_audit}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSkill(skill)}
                      className="inline-flex items-center gap-1 font-mono text-xs font-medium text-cyan-300 hover:text-cyan-200 cursor-pointer"
                    >
                      Inspect Skill →
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Multi-Agent Workstation Team & Orchestration Layer */}
      <div id="agent-team" className="mt-20">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.24em] text-cyan-400">
              <Cpu className="h-3.5 w-3.5" />
              MULTI-AGENT WORKSTATION ARCHITECTURE
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Verified Local AI Agents &amp; Responsibility Matrix
            </h3>
          </div>
          <p className="max-w-lg text-xs leading-relaxed text-slate-400">
            {agentsRoster.coordination_policy}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {agentsRoster.agents.map((agent) => {
            const tierBadge = PRICING_BADGE[agent.pricing_tier]
            return (
              <div
                key={agent.id}
                className="glass-panel flex flex-col justify-between rounded-2xl p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {agent.status}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-mono text-[10px] ${tierBadge.classes}`}
                    >
                      {tierBadge.label}
                    </span>
                  </div>

                  <h4 className="mt-3 font-display text-lg font-bold text-white">{agent.name}</h4>
                  <p className="font-mono text-xs text-cyan-300">{agent.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{agent.pricing_notes}</p>

                  <ul className="mt-3 space-y-1.5">
                    {agent.responsibilities.map((resp) => (
                      <li key={resp} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-t border-slate-800/80 pt-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    Models / Paths
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {agent.primary_models.map((m) => (
                      <span
                        key={m}
                        className="rounded bg-[#060A13] px-2 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-800"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Skill Inspector Slide-Over Drawer (Portaled to document.body above header stacking context) */}
      {selectedSkill &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedSkill.name}`}
            className="fixed inset-0 z-[90] flex justify-end bg-black/75 backdrop-blur-sm"
            onClick={() => onSelectSkill(null)}
          >
            <div
              className="flex h-full w-full max-w-xl flex-col justify-between overflow-y-auto border-l border-cyan-400/30 bg-[#080E1A] p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                        {selectedSkill.domain}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] ${
                          PRICING_BADGE[selectedSkill.pricing_tier].classes
                        }`}
                      >
                        {PRICING_BADGE[selectedSkill.pricing_tier].label}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-bold text-white">
                      {selectedSkill.name}
                    </h3>
                    <p className="font-mono text-xs text-slate-400">
                      id: {selectedSkill.id} · v{selectedSkill.version} · {selectedSkill.license}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSkill(null)}
                    aria-label="Close Skill Inspector"
                    className="rounded-full border border-slate-700 p-2 text-slate-300 hover:border-cyan-400/50 hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Capability Description
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {selectedSkill.summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs text-emerald-300">
                    <ShieldCheck className="h-4 w-4" />
                    Security Audit: {selectedSkill.security_audit.toUpperCase()} ({selectedSkill.validated_at})
                  </div>
                  <p className="text-xs text-slate-300">{selectedSkill.pricing_notes}</p>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Source &amp; Skill Definition Path
                  </h4>
                  <div className="mt-2 rounded-xl border border-slate-800 bg-[#060A13] p-3 font-mono text-xs text-cyan-200 break-all">
                    {selectedSkill.skill_path}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Sync / Verification Command
                  </h4>
                  <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-[#060A13] p-3 font-mono text-xs text-amber-200">
                    <span className="inline-flex items-center gap-2 truncate">
                      <Terminal className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <span className="truncate">{selectedSkill.install_command}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(selectedSkill)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-200 hover:border-cyan-400/50 cursor-pointer"
                    >
                      {copiedId === selectedSkill.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Compatible Agents
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSkill.compatible_agents.map((agId) => (
                      <span
                        key={agId}
                        className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 font-mono text-xs text-cyan-200"
                      >
                        <Layers className="h-3 w-3" />
                        {agentNameById[agId]?.name ?? agId}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                    Skill Dependencies
                  </h4>
                  {selectedSkill.dependencies.length === 0 ? (
                    <p className="mt-1.5 text-xs text-slate-400">
                      Zero external dependencies (standalone skill).
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSkill.dependencies.map((depId) => {
                        const target = registry.skills.find((s) => s.id === depId)
                        return (
                          <button
                            key={depId}
                            type="button"
                            onClick={() => target && onSelectSkill(target)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-xs text-amber-200 hover:border-amber-300 cursor-pointer"
                          >
                            <GitBranch className="h-3 w-3" />
                            {target ? target.name : depId}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-800 pt-4 flex justify-end">
                <MagneticButton variant="ghost" onClick={() => onSelectSkill(null)}>
                  Close Inspector
                </MagneticButton>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
