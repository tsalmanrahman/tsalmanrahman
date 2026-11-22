import React, { useState } from 'react'
import { ArrowDown, RotateCcw, ShieldCheck } from 'lucide-react'
import type { CareerData, IdentityLockManifest, ProfileData } from '../types/ecosystem'
import { InteractivePortraitStage, type PortraitRenderMode } from './InteractivePortraitStage'

interface PortraitHeroStageProps {
  profile: ProfileData
  career: CareerData
  identityLock: IdentityLockManifest
  onExplore: () => void
  onOpenVerificationModal: () => void
}

export const PortraitHeroStage: React.FC<PortraitHeroStageProps> = ({
  profile,
  career,
  identityLock,
  onExplore,
  onOpenVerificationModal,
}) => {
  const [renderMode, setRenderMode] = useState<PortraitRenderMode>('volumetric')
  const [replayNonce, setReplayNonce] = useState(0)

  const portraitSrc = `./assets/identity/${
    identityLock.web_path.split('/').pop() ?? 'salman-rahman-portrait.jpg'
  }`
  const shaPrefix = identityLock.sha256.slice(0, 12)

  return (
    <section
      id="portrait-stage"
      aria-label="Salman Rahman — Interactive Portrait Opening"
      className="relative mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-between px-4 pt-[68px] pb-4 sm:px-6 sm:pt-20 sm:pb-6 lg:px-8"
    >
      {/* Top Minimal Status & Identity Lock Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-medium text-slate-700 shadow-2xs backdrop-blur-md sm:px-3 sm:text-[11px]">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${
              career.available_for_hire ? 'bg-emerald-500' : 'bg-blue-600'
            }`}
          />
          <span>{profile.banner.badge_text}</span>
        </div>

        <button
          type="button"
          onClick={onOpenVerificationModal}
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-medium text-emerald-700 shadow-2xs backdrop-blur-md transition hover:border-emerald-400 hover:text-emerald-900 sm:px-3 sm:text-[11px] cursor-pointer"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>IDENTITY LOCK · {shaPrefix}</span>
        </button>
      </div>

      {/* Centerpiece Humanoid 3D Interactive Portrait */}
      <div className="relative z-0 my-auto flex w-full items-center justify-center">
        <InteractivePortraitStage
          variant="hero-stage"
          portraitSrc={portraitSrc}
          ownerName={profile.name}
          roleLabel="SQL Server & Enterprise ERP Engineer"
          identityShaPrefix={shaPrefix}
          onOpenVerificationModal={onOpenVerificationModal}
          renderMode={renderMode}
          onRenderModeChange={setRenderMode}
          replayNonce={replayNonce}
        />
      </div>

      {/* Bottom Editorial Anchor (vadimcarazan.com composition) */}
      <div className="relative z-10 space-y-2.5 sm:space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          {/* Bottom-left concise editorial positioning statement */}
          <p className="max-w-md text-xs leading-relaxed text-slate-600 sm:text-[15px]">
            {profile.short_bio}
          </p>

          {/* Bottom-right micro controls + primary Explore CTA */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-2.5">
            <div
              role="group"
              aria-label="Portrait 3D Render Mode"
              className="inline-flex rounded-full border border-slate-200 bg-white/90 p-0.5 shadow-2xs backdrop-blur-md"
            >
              <button
                type="button"
                onClick={() => setRenderMode('volumetric')}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition cursor-pointer ${
                  renderMode === 'volumetric'
                    ? 'bg-slate-950 font-semibold text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Volumetric
              </button>
              <button
                type="button"
                onClick={() => setRenderMode('mosaic')}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition cursor-pointer ${
                  renderMode === 'mosaic'
                    ? 'bg-blue-600 font-semibold text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                3D Mosaic
              </button>
            </div>

            <button
              type="button"
              onClick={() => setReplayNonce((n) => n + 1)}
              aria-label="Replay 3D Portrait Assembly"
              title="Replay 3D Portrait Assembly"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1.5 font-mono text-[10px] font-medium text-slate-700 shadow-2xs transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden md:inline">Replay</span>
            </button>

            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-xs font-medium text-white shadow-md transition hover:border-blue-600 hover:bg-blue-600 sm:px-5 sm:py-2.5 sm:text-sm cursor-pointer"
            >
              <span>Explore the story</span>
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Full-Width Bottom Editorial Display Name */}
        <div className="max-w-full overflow-hidden border-t border-slate-200/80 pt-2 sm:pt-3">
          <h1 className="font-editorial text-[clamp(2.9rem,11vw,9.2rem)] italic leading-[0.88] tracking-[-0.03em] text-slate-950 select-none">
            {profile.name}
          </h1>
        </div>
      </div>
    </section>
  )
}
