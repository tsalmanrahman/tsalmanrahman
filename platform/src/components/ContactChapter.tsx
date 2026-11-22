import React, { useState } from 'react'
import { Award, Briefcase, Check, Copy, ExternalLink, FolderGit2, Mail, MapPin, Send, ShieldCheck } from 'lucide-react'
import type { IdentityLockManifest, ProfileData, VerificationStatus } from '../types/ecosystem'

interface ContactChapterProps {
  profile: ProfileData
  identityLock: IdentityLockManifest
  verificationStatus: VerificationStatus
  onOpenVerificationModal: () => void
}

const INQUIRY_TOPICS = [
  'SQL Server & T-SQL',
  'Enterprise ERP Architecture',
  'Power BI & Data Analytics',
  'Full-Time / Advisory Role',
]

export const ContactChapter: React.FC<ContactChapterProps> = ({
  profile,
  identityLock,
  verificationStatus,
  onOpenVerificationModal,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [senderName, setSenderName] = useState('')
  const [selectedTopic, setSelectedTopic] = useState<string>(INQUIRY_TOPICS[0])
  const [message, setMessage] = useState('')

  const handleCopyEmail = async () => {
    if (!profile.contact.email) return
    try {
      await navigator.clipboard.writeText(profile.contact.email)
      setCopiedEmail(true)
      window.setTimeout(() => setCopiedEmail(false), 1800)
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  }

  const handleComposeMailto = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`[Portfolio Inquiry] ${selectedTopic} — ${senderName || 'Hello'}`)
    const bodyLines = [
      senderName ? `From: ${senderName}` : null,
      `Topic: ${selectedTopic}`,
      '',
      message.trim() || 'Hello Salman, I reviewed your portfolio and would like to connect.',
    ]
      .filter((line): line is string => line !== null)
      .join('\n')
    const href = `mailto:${profile.contact.email}?subject=${subject}&body=${encodeURIComponent(bodyLines)}`
    window.location.href = href
  }

  return (
    <section
      id="contact"
      data-chapter="contact"
      className="chapter-reveal relative z-10 mx-auto max-w-[1440px] scroll-mt-14 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <div className="mb-10 border-b border-slate-200/90 pb-8">
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
          09 / 09 — CONTACT &amp; DIRECT CHANNELS
        </span>
        <h2 className="mt-3 max-w-4xl font-editorial text-4xl italic leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Let&apos;s build dependable SQL Server &amp; enterprise ERP systems together.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Verified Direct Contact Cards */}
        <div className="space-y-4 lg:col-span-6">
          <div className="editorial-surface rounded-3xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-blue-700">
                <MapPin className="h-3.5 w-3.5" />
                {profile.location} · {profile.organization}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800">
                OPEN TO DISCUSSIONS
              </span>
            </div>

            {profile.contact.show_email && profile.contact.email && (
              <div className="mt-6 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                  Direct Verified Email
                </div>
                <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="font-editorial text-2xl italic text-slate-950 hover:text-blue-700 sm:text-3xl"
                  >
                    {profile.contact.email}
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 font-mono text-xs text-slate-700 transition hover:border-blue-400 hover:text-blue-700 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-800 transition hover:border-blue-400 hover:text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  LinkedIn
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>

              <a
                href={profile.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-800 transition hover:border-blue-400 hover:text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-slate-900" />
                  GitHub
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>

              <a
                href={profile.contact.credly}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-800 transition hover:border-blue-400 hover:text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Credly
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Vadim-Inspired Clean Brief Composer (Opens Native Mail Draft) */}
        <form
          onSubmit={handleComposeMailto}
          className="editorial-surface rounded-3xl p-6 sm:p-8 lg:col-span-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-editorial text-2xl italic text-slate-950 sm:text-3xl">
              Send a quick note or brief.
            </h3>
            <Mail className="h-4 w-4 text-blue-600" />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="contact-name"
                className="block font-mono text-[10px] uppercase tracking-wider text-slate-500"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="e.g. Hiring Manager or Tech Lead"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500">
                Focus Area
              </span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {INQUIRY_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`rounded-full border px-3 py-1 font-mono text-[11px] transition cursor-pointer ${
                      selectedTopic === topic
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block font-mono text-[10px] uppercase tracking-wider text-slate-500"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell Salman about your SQL Server, ERP, or analytics initiative..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-5 py-2.5 text-xs font-medium text-white transition hover:border-blue-600 hover:bg-blue-600 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Open Email Draft</span>
              </button>
              <span className="font-mono text-[11px] text-slate-500">
                Opens mail client addressed to {profile.contact.email}
              </span>
            </div>
          </div>
        </form>
      </div>

      {/* Editorial Footer Ledger */}
      <div className="mt-14 flex flex-col gap-4 border-t border-slate-200 pt-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
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
    </section>
  )
}
