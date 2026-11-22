import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { ProfileData } from '../types/ecosystem'

interface KovalFooterProps {
  profile: ProfileData
}

export const KovalFooter: React.FC<KovalFooterProps> = ({
  profile,
}) => {
  const [note, setNote] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.contact.email) return
    const subject = encodeURIComponent('Portfolio Inquiry — Salman Rahman')
    const body = encodeURIComponent(
      note.trim() || 'Hello Salman, I reviewed your portal and would like to connect.',
    )
    window.location.href = `mailto:${profile.contact.email}?subject=${subject}&body=${body}`
  }

  const handleCopyEmail = async () => {
    if (!profile.contact.email) return
    try {
      await navigator.clipboard.writeText(profile.contact.email)
      setCopiedEmail(true)
      window.setTimeout(() => setCopiedEmail(false), 1800)
    } catch {
      // Clipboard unavailable in restricted contexts
    }
  }

  return (
    <footer
      id="contact"
      className="relative z-10 border-t border-[#111110] bg-[#111110] text-white"
    >
      <div className="mx-auto max-w-[1320px] px-5 pt-16 pb-10 sm:px-8 lg:px-12 lg:pt-24">
        {/* Heading */}
        <div>
          <h2 className="font-display text-[36px] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[48px] lg:text-[56px]">
            <span>Start with </span>
            <span className="font-mono text-[20px] font-normal uppercase tracking-[0.06em] sm:text-[24px]">
              A MESSAGE.
            </span>
          </h2>
        </div>

        {/* Inverted Console Mail Form */}
        <form
          onSubmit={handleSendMail}
          className="mt-10 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_244px] lg:gap-12"
        >
          <div>
            <div className="flex h-12 items-stretch">
              <span className="inline-flex items-center bg-white px-3.5 font-mono text-sm font-medium text-[#111110] select-none sm:px-4 sm:text-base">
                mailto://
              </span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                aria-label="Write a quick message for Salman Rahman"
                placeholder="Write a brief note or open email directly..."
                className="min-w-0 flex-1 border-b-2 border-white/25 bg-transparent px-3 text-base text-white placeholder:text-white/50 focus:border-white focus:outline-none sm:text-xl"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-white/65">
              <span>{profile.contact.email}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1 border border-white/35 px-2 py-0.5 text-[11px] text-white transition hover:bg-white hover:text-[#111110] cursor-pointer"
              >
                {copiedEmail ? (
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

          <button type="submit" className="koval-cut-btn-dark w-full lg:w-[244px]">
            <span className="koval-cut-btn-dark-slit" aria-hidden="true" />
            <span className="koval-cut-btn-dark-body flex-1">Send email</span>
          </button>
        </form>

        {/* Bottom Single-Row Chip Bar */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/20 pt-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="koval-chip-dark"
            >
              <span className="koval-chip-dark-prefix">/</span>
              <span className="koval-chip-label">linkedin</span>
            </a>
            <a
              href={profile.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="koval-chip-dark"
            >
              <span className="koval-chip-dark-prefix">/</span>
              <span className="koval-chip-label">github</span>
            </a>
            <a
              href={profile.contact.credly}
              target="_blank"
              rel="noopener noreferrer"
              className="koval-chip-dark"
            >
              <span className="koval-chip-dark-prefix">/</span>
              <span className="koval-chip-label">credly</span>
            </a>
          </div>

          <span className="font-mono text-xs text-white/60">
            © {new Date().getFullYear()} {profile.name} · {profile.location}
          </span>
        </div>

        {/* Inverted Dot-Matrix Signature Wordmark */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <svg viewBox="0 0 1200 124" className="h-auto w-full" aria-hidden="true">
            <defs>
              <pattern id="koval-footer-dots" width="4" height="4" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.15" fill="#ffffff" fillOpacity="0.82" />
              </pattern>
            </defs>
            <text
              x="0"
              y="98"
              fill="url(#koval-footer-dots)"
              fontFamily="Instrument Sans, sans-serif"
              fontWeight="700"
              fontSize="110"
              letterSpacing="-3"
            >
              Salman Rahman
            </text>
          </svg>
        </div>
      </div>
    </footer>
  )
}
