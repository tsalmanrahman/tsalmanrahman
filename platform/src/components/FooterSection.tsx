import React from 'react'
import { Award, Briefcase, ExternalLink, FolderGit2, Mail, MapPin, ShieldCheck } from 'lucide-react'
import type { IdentityLockManifest, ProfileData, VerificationStatus } from '../types/ecosystem'
import { MagneticButton } from './MagneticButton'

interface FooterSectionProps {
  profile: ProfileData
  identityLock: IdentityLockManifest
  verificationStatus: VerificationStatus
  onOpenVerificationModal: () => void
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  profile,
  identityLock,
  verificationStatus,
  onOpenVerificationModal,
}) => {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/85 py-14 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="space-y-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[11px] font-medium text-blue-700">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              {profile.location} · {profile.organization}
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Need dependable SQL Server architecture, ERP reconciliation, or BI automation?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
              {profile.short_bio}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <MagneticButton href={profile.contact.linkedin} target="_blank" variant="primary">
              <Briefcase className="h-4 w-4" />
              LinkedIn Profile
              <ExternalLink className="h-3.5 w-3.5" />
            </MagneticButton>
            <MagneticButton href={profile.contact.github} target="_blank" variant="ghost">
              <FolderGit2 className="h-4 w-4" />
              GitHub
            </MagneticButton>
            <MagneticButton href={profile.contact.credly} target="_blank" variant="ghost">
              <Award className="h-4 w-4" />
              Credly
            </MagneticButton>
            {profile.contact.show_email && profile.contact.email && (
              <MagneticButton href={`mailto:${profile.contact.email}`} variant="secondary">
                <Mail className="h-4 w-4" />
                Email Salman
              </MagneticButton>
            )}
          </div>
        </div>

        <div className="hairline-divider my-8" />

        <div className="flex flex-col gap-4 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 font-mono">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              IDENTITY LOCK: {identityLock.sha256.slice(0, 12)}...
            </span>
            <span className="text-slate-300">|</span>
            <span>LAST VERIFIED: {verificationStatus.last_verified_date}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onOpenVerificationModal}
              className="font-mono text-xs font-semibold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900 cursor-pointer"
            >
              Inspect Data Verification &amp; Pending Confirmations
            </button>
            <span className="font-mono text-slate-500">
              © {new Date().getFullYear()} {profile.name}
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
