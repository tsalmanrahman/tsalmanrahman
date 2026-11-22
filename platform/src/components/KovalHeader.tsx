import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface KovalHeaderProps {
  githubUrl: string
  linkedinUrl: string
  activeSectionId: string
  onNavigate: (targetId: string) => void
}

const GeometricSquareMark: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M2 2H20V6H6V20H2V2Z" fill="#111110" />
    <path d="M8 8H26V26H8V8ZM12 12V22H22V12H12Z" fill="#111110" />
  </svg>
)

export const KovalHeader: React.FC<KovalHeaderProps> = ({
  githubUrl,
  linkedinUrl,
  activeSectionId,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  const jump = (targetId: string) => {
    setMobileMenuOpen(false)
    onNavigate(targetId)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#111110]/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:grid lg:h-[88px] lg:grid-cols-[minmax(0,1fr)_244px] lg:gap-12 lg:px-12">
          {/* Desktop [content] chip bar */}
          <div className="hidden items-center justify-between gap-4 lg:flex">
            <nav aria-label="Primary sections" className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => jump('top')}
                data-active={activeSectionId === 'top'}
                className="koval-chip"
              >
                <span className="koval-chip-prefix">www</span>
                <span className="koval-chip-label">salmanrahman</span>
              </button>

              <button
                type="button"
                onClick={() => jump('work')}
                data-active={activeSectionId === 'work'}
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">work</span>
              </button>

              <button
                type="button"
                onClick={() => jump('credentials')}
                data-active={activeSectionId === 'credentials'}
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">credentials</span>
              </button>

              <button
                type="button"
                onClick={() => jump('journey')}
                data-active={activeSectionId === 'journey'}
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">journey</span>
              </button>
            </nav>

            <div className="flex items-center gap-2.5">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">linkedin</span>
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="koval-chip"
              >
                <span className="koval-chip-prefix">/</span>
                <span className="koval-chip-label">github</span>
              </a>
            </div>
          </div>

          {/* Mobile left menu chip */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="koval-chip"
            >
              <span className="koval-chip-prefix">||</span>
              <span className="koval-chip-label">menu</span>
            </button>
          </div>

          {/* Desktop Right [rail] / Mobile Right Brand Mark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              jump('top')
            }}
            className="inline-flex shrink-0 items-center justify-end gap-2.5 whitespace-nowrap text-[#111110] lg:justify-start lg:gap-3"
          >
            <GeometricSquareMark />
            <span className="font-sans text-xs font-semibold tracking-[0.05em] uppercase sm:text-base sm:tracking-[0.06em]">
              SALMAN RAHMAN
            </span>
          </a>
        </div>
      </header>

      {/* Sharp 0px Mobile Navigation Drawer */}
      {mobileMenuOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="fixed inset-0 z-[90] flex justify-start bg-[#111110]/40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="flex h-full w-full max-w-xs flex-col justify-between border-r border-[#111110] bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#111110]/15 pb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#111110]">
                    SALMAN RAHMAN
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close Menu"
                    className="border border-[#111110] p-1.5 text-[#111110] hover:bg-[#111110] hover:text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  {[
                    { prefix: 'www', label: 'home', id: 'top' },
                    { prefix: '/', label: 'work', id: 'work' },
                    { prefix: '/', label: 'credentials', id: 'credentials' },
                    { prefix: '/', label: 'journey', id: 'journey' },
                    { prefix: '/', label: 'contact', id: 'contact' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => jump(item.id)}
                      className="koval-chip w-fit"
                    >
                      <span className="koval-chip-prefix">{item.prefix}</span>
                      <span className="koval-chip-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-[#111110]/15 pt-4">
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="koval-chip"
                >
                  <span className="koval-chip-prefix">/</span>
                  <span className="koval-chip-label">linkedin</span>
                </a>
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="koval-chip"
                >
                  <span className="koval-chip-prefix">/</span>
                  <span className="koval-chip-label">github</span>
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
