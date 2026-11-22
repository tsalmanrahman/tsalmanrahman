import React, { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

interface CinematicPreloaderProps {
  onComplete: () => void
  sha256Prefix: string
  skillCount: number
}

const BOOT_SEQUENCE = [
  { code: 'SYS.INIT', detail: 'Mounting Antigravity Light Spatial Engine' },
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
      className={`fixed inset-0 z-[90] flex flex-col justify-between bg-[#F8FAFC] px-6 py-8 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] sm:px-12 ${
        exiting ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="hud-grid pointer-events-none absolute inset-0 opacity-85" />

      <div className="relative z-10 flex items-center justify-between text-xs font-mono text-slate-600">
        <span className="inline-flex items-center gap-2 text-blue-700 font-medium">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
          TSALMANRAHMAN // UNIFIED ECOSYSTEM v2.0
        </span>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-full border border-slate-300 bg-white px-3.5 py-1 font-mono text-[11px] font-medium text-slate-700 shadow-xs transition hover:border-blue-500 hover:text-blue-700 cursor-pointer"
        >
          SKIP INTRO
        </button>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-mono text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            IDENTITY LOCK SHA-256: {sha256Prefix}...
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Salman Rahman
          </h2>
          <p className="text-sm text-slate-600">
            SQL Server &amp; ERP Database Engineering · {skillCount} Audited Free AI Skills
          </p>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white/95 p-4 font-mono text-xs shadow-sm">
          {BOOT_SEQUENCE.map((item, idx) => {
            const done = idx < stepIdx || progress === 100
            const active = idx === stepIdx && progress < 100
            return (
              <div
                key={item.code}
                className={`flex items-center justify-between gap-4 transition-opacity duration-200 ${
                  idx <= stepIdx ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      done ? 'bg-emerald-600' : active ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-blue-700 font-semibold">{item.code}</span>
                  <span className="hidden text-slate-600 sm:inline">{item.detail}</span>
                </div>
                <span className={done ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                  {done ? '[OK]' : active ? '[RUNNING]' : '[WAIT]'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between font-mono text-[11px] text-slate-500">
            <span>BOOTSTRAPPING WORKSPACE</span>
            <span className="text-blue-700 font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 transition-all duration-300 ease-out"
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
