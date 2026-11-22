import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, Copy, GitBranch, Search, ShieldCheck, Terminal, X } from 'lucide-react'
import type {
  AiAgentEntry,
  AiAgentsRoster,
  AiSkillEntry,
  AiSkillsRegistry,
  PricingTier,
} from '../types/ecosystem'

interface AiSkillsHubSectionProps {
  registry: AiSkillsRegistry
  agentsRoster: AiAgentsRoster
  selectedSkill: AiSkillEntry | null
  onSelectSkill: (skill: AiSkillEntry | null) => void
}

const PRICING_BADGE: Record<PricingTier, { label: string; classes: string }> = {
  'free-open-source': {
    label: 'Free & Open Source',
    classes: 'border-[#111110] bg-[#111110] text-white',
  },
  'free-tier-limited': {
    label: 'Free Tier (Limited)',
    classes: 'border-[#111110]/40 bg-[#F4F4F2] text-[#111110]',
  },
  freemium: {
    label: 'Freemium',
    classes: 'border-[#111110]/40 bg-white text-[#111110]',
  },
  paid: {
    label: 'Paid',
    classes: 'border-[#9C1C1C] bg-white text-[#9C1C1C]',
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
  const [sourceFilter, setSourceFilter] = useState<'all' | 'repo-authored' | 'local-verified'>(
    'all',
  )
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
      // Clipboard unavailable in restricted browser frames
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

  const resetFilters = () => {
    setSearch('')
    setDomainFilter('All')
    setSourceFilter('all')
    setPricingFilter('all')
    setAgentFilter('all')
  }

  return (
    <section id="skills-hub" className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      {/* Header & 3-Cell Koval Counter Bar */}
      <div className="border-b border-[#111110]/15 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-[#656561]">
              <mark className="mr-2 inline-block bg-[#111110] px-2 py-0.5 text-white">
                SKILL HUB
              </mark>
              VALIDATED BY SCRIPTS/SKILLS_HUB.PY
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-[-0.03em] text-[#111110] sm:text-4xl">
              Shared AI Skills &amp; Agent Roster.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#3A3A38]">
              Security-scanned skills synchronized across Antigravity, OpenCode CLI, Ollama, and
              compatible runtimes with explicit pricing transparency.
            </p>
          </div>

          <div className="grid grid-cols-3 border border-[#111110] bg-white">
            <div className="border-r border-[#111110]/20 px-4 py-3">
              <div className="font-display text-2xl font-bold text-[#111110]">
                {registry.skills.length}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                SKILLS
              </div>
            </div>
            <div className="border-r border-[#111110]/20 px-4 py-3">
              <div className="font-display text-2xl font-bold text-[#111110]">
                {registry.skills.filter((s) => s.source_type === 'repo-authored').length}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                FLAGSHIPS
              </div>
            </div>
            <div className="px-4 py-3">
              <div className="font-display text-2xl font-bold text-[#111110]">
                {agentsRoster.agents.length}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                AGENTS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Console Bar */}
      <div className="mt-6 space-y-4 border border-[#111110] bg-white p-5">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="flex h-11 items-stretch border border-[#111110]/25 bg-white lg:col-span-5">
            <span className="inline-flex items-center bg-[#111110] px-3 font-mono text-xs text-white select-none">
              <Search className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Filter AI skills"
              placeholder="Search SQL, ERP, security, tag..."
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#111110] placeholder:text-[#656561] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              aria-label="Filter by Source Type"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
              className="h-11 w-full border border-[#111110]/25 bg-white px-3 font-mono text-xs text-[#111110] focus:border-[#111110] focus:outline-none"
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
              className="h-11 w-full border border-[#111110]/25 bg-white px-3 font-mono text-xs text-[#111110] focus:border-[#111110] focus:outline-none"
            >
              <option value="all">All Tiers</option>
              <option value="free-open-source">Free &amp; OSS</option>
              <option value="free-tier-limited">Free Tier</option>
              <option value="freemium">Freemium</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              aria-label="Filter by Compatible Agent"
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="h-11 w-full border border-[#111110]/25 bg-white px-3 font-mono text-xs text-[#111110] focus:border-[#111110] focus:outline-none"
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

        <div className="flex flex-wrap items-center gap-2 border-t border-[#111110]/10 pt-3">
          {domains.map((domain) => {
            const active = domainFilter === domain
            return (
              <button
                key={domain}
                type="button"
                onClick={() => setDomainFilter(domain)}
                className={`border px-2.5 py-1 font-mono text-[11px] transition cursor-pointer ${
                  active
                    ? 'border-[#111110] bg-[#111110] text-white'
                    : 'border-[#111110]/25 bg-white text-[#3A3A38] hover:border-[#111110]'
                }`}
              >
                {domain}
              </button>
            )
          })}

          <span className="ml-auto font-mono text-xs text-[#656561]">
            Showing <strong className="text-[#111110]">{filteredSkills.length}</strong> of{' '}
            {registry.skills.length}
          </span>
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="mt-6 border border-[#111110]/25 bg-[#F4F4F2] p-10 text-center">
          <p className="font-display text-lg font-bold text-[#111110]">
            No skills match your active filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 border border-[#111110] bg-[#111110] px-4 py-2 font-mono text-xs text-white transition hover:bg-white hover:text-[#111110] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredSkills.map((skill) => {
            const pricing = PRICING_BADGE[skill.pricing_tier]
            return (
              <article
                key={skill.id}
                className="flex flex-col justify-between border border-[#111110]/25 bg-white p-5 transition-colors hover:border-[#111110]"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                      {skill.domain}
                    </span>
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${pricing.classes}`}
                    >
                      {pricing.label}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-lg font-bold leading-snug text-[#111110]">
                      {skill.name}
                    </h3>
                    <span className="shrink-0 font-mono text-[11px] text-[#656561]">
                      v{skill.version}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-[11px] text-[#656561]">
                    {skill.source_type === 'repo-authored' ? 'Repo Flagship' : 'Local Audited'} ·{' '}
                    {skill.license}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#3A3A38]">{skill.summary}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {skill.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#111110]/15 bg-[#F4F4F2] px-1.5 py-0.5 font-mono text-[10px] text-[#3A3A38]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-[#111110]/15 pt-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {skill.compatible_agents.map((agId) => (
                      <span
                        key={agId}
                        className="border border-[#111110]/20 px-2 py-0.5 font-mono text-[10px] text-[#3A3A38]"
                      >
                        {agentNameById[agId]?.name ?? agId}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(skill)}
                      className="inline-flex items-center gap-1 border border-[#111110]/25 px-2.5 py-1 font-mono text-[11px] text-[#111110] transition hover:border-[#111110] cursor-pointer"
                    >
                      {copiedId === skill.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>cmd</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectSkill(skill)}
                      className="koval-chip"
                    >
                      <span className="koval-chip-prefix">/</span>
                      <span className="koval-chip-label">inspect</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Multi-Agent Roster Section */}
      <div id="agent-team" className="mt-14 border-t border-[#111110]/20 pt-10">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
              MULTI-AGENT ROSTER
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-[#111110]">
              Verified Workstation &amp; CLI Agents ({agentsRoster.agents.length})
            </h3>
          </div>
          <p className="max-w-md text-xs text-[#656561]">{agentsRoster.coordination_policy}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agentsRoster.agents.map((agent) => {
            const tierBadge = PRICING_BADGE[agent.pricing_tier]
            return (
              <div
                key={agent.id}
                className="flex flex-col justify-between border border-[#111110]/25 bg-white p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                      {agent.status}
                    </span>
                    <span
                      className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tierBadge.classes}`}
                    >
                      {tierBadge.label}
                    </span>
                  </div>

                  <h4 className="mt-2 font-display text-lg font-bold text-[#111110]">
                    {agent.name}
                  </h4>
                  <p className="font-mono text-xs text-[#656561]">{agent.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[#3A3A38]">
                    {agent.pricing_notes}
                  </p>

                  <ul className="mt-3 space-y-1.5 border-t border-[#111110]/10 pt-3">
                    {agent.responsibilities.map((resp) => (
                      <li key={resp} className="flex items-start gap-2 text-xs text-[#3A3A38]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#111110]" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-t border-[#111110]/10 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.primary_models.map((m) => (
                      <span
                        key={m}
                        className="border border-[#111110]/15 bg-[#F4F4F2] px-2 py-0.5 font-mono text-[10px] text-[#111110]"
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

      {/* Sharp 0px Skill Inspector Drawer */}
      {selectedSkill &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedSkill.name}`}
            className="fixed inset-0 z-[100] flex justify-end bg-[#111110]/45"
            onClick={() => onSelectSkill(null)}
          >
            <div
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
              className="flex h-full w-full max-w-xl flex-col justify-between overflow-y-auto overscroll-contain border-l border-[#111110] bg-white p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-[#111110]/15 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#656561]">
                        {selectedSkill.domain}
                      </span>
                      <span
                        className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                          PRICING_BADGE[selectedSkill.pricing_tier].classes
                        }`}
                      >
                        {PRICING_BADGE[selectedSkill.pricing_tier].label}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl font-bold text-[#111110]">
                      {selectedSkill.name}
                    </h3>
                    <p className="font-mono text-xs text-[#656561]">
                      id: {selectedSkill.id} · v{selectedSkill.version} · {selectedSkill.license}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectSkill(null)}
                    aria-label="Close Skill Inspector"
                    className="border border-[#111110] p-1.5 text-[#111110] hover:bg-[#111110] hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#656561]">
                    Capability Summary
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-[#3A3A38]">
                    {selectedSkill.summary}
                  </p>
                </div>

                <div className="border border-[#111110]/20 bg-[#F4F4F2] p-4 space-y-1.5">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[#111110]">
                    <ShieldCheck className="h-4 w-4" />
                    SECURITY AUDIT: {selectedSkill.security_audit.toUpperCase()} (
                    {selectedSkill.validated_at})
                  </div>
                  <p className="text-xs text-[#3A3A38]">{selectedSkill.pricing_notes}</p>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#656561]">
                    Skill Definition Path
                  </h4>
                  <div className="mt-2 border border-[#111110]/20 bg-[#F4F4F2] p-3 font-mono text-xs text-[#111110] break-all">
                    {selectedSkill.skill_path}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#656561]">
                    Sync / Verification Command
                  </h4>
                  <div className="mt-2 flex items-center justify-between gap-2 bg-[#111110] p-3 font-mono text-xs text-white">
                    <span className="inline-flex items-center gap-2 truncate">
                      <Terminal className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{selectedSkill.install_command}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCommand(selectedSkill)}
                      className="inline-flex shrink-0 items-center gap-1 border border-white/40 px-2.5 py-1 text-[11px] text-white hover:bg-white hover:text-[#111110] cursor-pointer"
                    >
                      {copiedId === selectedSkill.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#656561]">
                    Compatible Agents
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSkill.compatible_agents.map((agId) => (
                      <span
                        key={agId}
                        className="border border-[#111110]/25 bg-[#F4F4F2] px-2.5 py-1 font-mono text-xs text-[#111110]"
                      >
                        {agentNameById[agId]?.name ?? agId}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#656561]">
                    Dependencies
                  </h4>
                  {selectedSkill.dependencies.length === 0 ? (
                    <p className="mt-1.5 text-xs text-[#656561]">Standalone skill (0 deps).</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSkill.dependencies.map((depId) => {
                        const target = registry.skills.find((s) => s.id === depId)
                        return (
                          <button
                            key={depId}
                            type="button"
                            onClick={() => target && onSelectSkill(target)}
                            className="inline-flex items-center gap-1.5 border border-[#111110]/25 bg-[#F4F4F2] px-2.5 py-1 font-mono text-xs text-[#111110] hover:border-[#111110] cursor-pointer"
                          >
                            <GitBranch className="h-3 w-3" />
                            <span>{target ? target.name : depId}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end border-t border-[#111110]/15 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectSkill(null)}
                  className="koval-chip"
                >
                  <span className="koval-chip-prefix">
                    <ArrowLeft className="h-3 w-3" />
                  </span>
                  <span className="koval-chip-label">close</span>
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  )
}
