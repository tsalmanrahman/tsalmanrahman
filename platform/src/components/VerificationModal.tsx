import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Lock, ShieldCheck, X } from 'lucide-react'
import type { IdentityLockManifest, VerificationStatus } from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'

interface VerificationModalProps {
  open: boolean
  onClose: () => void
  verificationStatus: VerificationStatus
  identityLock: IdentityLockManifest
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  open,
  onClose,
  verificationStatus,
  identityLock,
}) => {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="LinkedIn Verification and Identity Lock Audit"
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto overscroll-contain border border-[#111110] bg-white p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-emerald-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              TRUTHFULNESS &amp; IDENTITY LOCK LEDGER
            </span>
            <h3 className="mt-1 font-display text-2xl font-bold text-slate-950">
              Verified Profile Sources &amp; Pending Confirmations
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Verification Modal"
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:border-blue-400 hover:text-slate-950 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          <p className="text-sm leading-relaxed text-slate-700">{verificationStatus.policy}</p>

          {/* Identity Lock Summary */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800">
              <Lock className="h-4 w-4 text-emerald-600" />
              IDENTITY LOCK ENFORCED · ORIGINAL PORTRAIT IMMUTABLE
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 font-mono text-[11px] text-slate-700 sm:grid-cols-2">
              <div>Owner: {identityLock.owner}</div>
              <div>Verified Date: {identityLock.verified_date}</div>
              <div className="sm:col-span-2 break-all font-medium text-emerald-800">
                SHA-256: {identityLock.sha256}
              </div>
              <div className="sm:col-span-2 text-slate-600">
                Archive: {identityLock.original_path} ({identityLock.size_bytes} bytes)
              </div>
            </div>
          </div>

          {/* Verified Sections */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
              Verified Facts ({verificationStatus.verified_sections.length})
            </h4>
            <div className="mt-2 space-y-2">
              {verificationStatus.verified_sections.map((item) => (
                <div
                  key={item.section}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-950">{item.section}</p>
                    <p className="mt-0.5 text-slate-600">
                      {item.source} · Verified {item.verified_date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Confirmations */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-800">
              Unavailable / Pending Human Confirmation (Never Fabricated)
            </h4>
            <div className="mt-2 space-y-2">
              {verificationStatus.pending_confirmation.map((item) => (
                <div
                  key={item.field}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-amber-950">{item.field}</span>
                      <span className="rounded border border-amber-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase text-amber-800">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-slate-700">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Excluded Privacy / Clutter Items */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-500">
              Excluded for Privacy &amp; Credibility Hygiene
            </h4>
            <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {verificationStatus.excluded_items.map((ex) => (
                <li
                  key={ex}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                >
                  • {ex}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-7 flex justify-end border-t border-slate-200 pt-4">
          <MagneticButton variant="primary" onClick={onClose}>
            Done
          </MagneticButton>
        </div>
      </div>
    </div>,
    document.body,
  )
}
