import React, { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

interface CinematicPreloaderProps {
  onComplete: () => void
  sha256Prefix: string
  skillCount: number
}

const BOOT_SEQUENCE = [
  { code: 'SYS.INIT', detail: 'Mounting Midnight-Slate Spatial Engine' },
  { code: 'IDENTITY_LOCK', detail: 'Verifying SHA-256 Portrait Integrity' },
  { code: 'ERP_DATA_MESH', detail: 'Hydrating LinkedIn & SQL Server Telemetry' },
  { code: 'AI_SKILLS_HUB', detail: 'Indexing Shared Multi-Agent Skills Registry' },
]

export const CinematicPreloader: React.FC<CinematicPreloaderProps> = ({
  onComplete,
  sha256Prefix,
  skillCount,
}) => {
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(14)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      onComplete()
      return
    }

    const timers: number[] = []
    timers.push(window.setTimeout(() => { setStepIdx(1); setProgress(42) }, 220))
    timers.push(window.setTimeout(() => { setStepIdx(2); setProgress(74) }, 460))
    timers.push(window.setTimeout(() => { setStepIdx(3); setProgress(100) }, 720))
    timers.push(window.setTimeout(() => setExiting(true), 1020))
    timers.push(window.setTimeout(() => onComplete(), 1450))

    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [onComplete])

  const handleSkip = () => {
    setExiting(true)
    window.setTimeout(onComplete, 260)
  }

  return (
    <div
      role="status"
      aria-label="Loading Salman Rahman Platform"
      className={`fixed inset-0 z-[90] flex flex-col justify-between bg-[#060A13] px-6 py-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] sm:px-12 ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="inline-flex items-center gap-2 text-cyan-300">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          TSALMANRAHMAN // UNIFIED ECOSYSTEM v2.0
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-slate-700/80 bg-slate-900/70 px-3 py-1 font-mono text-[11px] text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-200 cursor-pointer"
        >
          SKIP INTRO
        </button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            IDENTITY LOCK SHA-256: {sha256Prefix}...
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Salman Rahman
          </h2>
          <p className="text-sm text-slate-400">
            SQL Server &amp; ERP Database Engineering · {skillCount} Audited Free AI Skills
          </p>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-slate-800/90 bg-[#0B1220]/90 p-4 font-mono text-xs">
          {BOOT_SEQUENCE.map((item, idx) => {
            const done = idx < stepIdx || progress === 100
            const active = idx === stepIdx && progress < 100
            return (
              <div
                key={item.code}
                className={`flex items-center justify-between gap-4 transition-opacity duration-200 ${
                  idx <= stepIdx ? 'opacity-100' : 'opacity-35'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      done ? 'bg-emerald-400' : active ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-cyan-300 font-semibold">{item.code}</span>
                  <span className="hidden text-slate-400 sm:inline">{item.detail}</span>
                </div>
                <span className={done ? 'text-emerald-400' : 'text-amber-300'}>
                  {done ? '[OK]' : active ? '[RUNNING]' : '[WAIT]'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between font-mono text-[11px] text-slate-400">
            <span>BOOTSTRAPPING WORKSPACE</span>
            <span className="text-cyan-300">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between font-mono text-[11px] text-slate-500">
        <span>DHAKA · BANGLADESH</span>
        <span>LOCAL VERIFIED DATA &amp; OPEN SKILLS</span>
      </div>
    </div>
  )
}
