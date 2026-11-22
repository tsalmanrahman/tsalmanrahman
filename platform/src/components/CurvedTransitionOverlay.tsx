import React from 'react'

interface CurvedTransitionOverlayProps {
  active: boolean
  label: string
}

export const CurvedTransitionOverlay: React.FC<CurvedTransitionOverlayProps> = ({ active, label }) => {
  return (
    <div
      aria-hidden={!active}
      className={`pointer-events-none fixed inset-0 z-[75] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
        active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="block h-14 w-full text-white"
      >
        <path
          fill="currentColor"
          d={
            active
              ? 'M0,120 Q720,0 1440,120 L1440,120 L0,120 Z'
              : 'M0,120 Q720,120 1440,120 L1440,120 L0,120 Z'
          }
        />
      </svg>
      <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col items-center justify-center border-t border-slate-200 bg-white">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue-600">
          SYS.SWITCH // MODE_TRANSITION
        </span>
        <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {label}
        </p>
      </div>
    </div>
  )
}
