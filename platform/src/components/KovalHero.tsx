import React, { useState } from 'react'
import type { IdentityLockManifest, ProfileData } from '../types/ecosystem'

interface KovalHeroProps {
  profile: ProfileData
  identityLock: IdentityLockManifest
  onExploreWork: () => void
  onSearchPortal: (query: string) => void
}

export const KovalHero: React.FC<KovalHeroProps> = ({
  profile,
  identityLock,
  onExploreWork,
  onSearchPortal,
}) => {
  const [query, setQuery] = useState('')

  const portraitSrc = `./assets/identity/${
    identityLock.web_path.split('/').pop() ?? 'salman-rahman-portrait.jpg'
  }`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) {
      onSearchPortal(trimmed)
    } else {
      onExploreWork()
    }
  }

  return (
    <section id="top" className="mx-auto max-w-[1320px] px-5 pt-10 pb-10 sm:px-8 lg:px-12 lg:pt-16 lg:pb-12">
      {/* Row 1: Asymmetric Two-Zone Hero (Left Claim + Right Genuine Identity Portrait) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_244px] lg:items-end lg:gap-12">
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[#111110] sm:text-sm">
            <mark className="mr-2.5 inline-block bg-[#111110] px-2.5 py-1 text-white">
              SQL &amp; ERP ENGINEER
            </mark>
            <span>AT {profile.organization} · DHAKA</span>
          </p>

          <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.08] tracking-[-0.03em] text-[#111110] sm:text-[54px] lg:text-[64px]">
            {profile.name}.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#3A3A38] sm:text-lg">
            Microsoft SQL Server, T-SQL optimization, InteAcc ERP &amp; Web POS, C# (.NET), and
            Python.
          </p>
        </div>

        {/* Right Rail: Architectural Portrait Frame */}
        <div className="flex flex-col items-start lg:items-stretch">
          <div className="w-40 overflow-hidden border border-[#111110] bg-[#F4F4F2] sm:w-48 lg:w-[244px]">
            <img
              src={portraitSrc}
              alt={`${profile.name} — ${profile.headline}`}
              className="aspect-square w-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Koval Interactive Console Input Bar + Signature Cut-Button */}
      <form
        onSubmit={handleSubmit}
        className="mt-12 grid grid-cols-1 items-start gap-5 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_244px] lg:gap-12"
      >
        <div>
          <div className="flex h-12 items-stretch">
            <span className="inline-flex items-center bg-[#111110] px-3.5 font-mono text-sm text-white select-none sm:px-4 sm:text-base">
              salman://
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search projects, credentials, and technical stack"
              placeholder="sql, erp, pyrix, ibm, c#..."
              className="min-w-0 flex-1 border-b-2 border-[#111110]/20 bg-transparent px-3 text-base text-[#111110] placeholder:text-[#656561] focus:border-[#111110] focus:outline-none sm:text-xl"
            />
          </div>
          <p className="mt-2 font-mono text-xs text-[#656561]">
            Enter a topic to filter projects &amp; technical stack, or browse below.
          </p>
        </div>

        <button type="submit" className="koval-cut-btn w-full lg:w-[244px]">
          <span className="koval-cut-btn-slit" aria-hidden="true" />
          <span className="koval-cut-btn-body flex-1">
            {query.trim() ? 'Search portal' : 'Explore work'}
          </span>
        </button>
      </form>

      {/* Row 3: Dot-Matrix Display Statement (Pure SVG Circle Pattern, Zero Gradients) */}
      <div className="mt-14 border-t border-[#111110]/10 pt-8 lg:mt-16">
        <svg viewBox="0 0 1200 108" className="h-auto w-full" aria-hidden="true">
          <defs>
            <pattern id="koval-hero-dots" width="4" height="4" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.15" fill="#111110" fillOpacity="0.82" />
            </pattern>
          </defs>
          <text
            x="0"
            y="84"
            fill="url(#koval-hero-dots)"
            fontFamily="Instrument Sans, sans-serif"
            fontWeight="700"
            fontSize="92"
            letterSpacing="-3"
          >
            Built for data integrity.
          </text>
        </svg>
      </div>
    </section>
  )
}
