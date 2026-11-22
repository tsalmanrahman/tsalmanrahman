import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, Check, Copy } from 'lucide-react'
import type { ProjectItem } from '../types/ecosystem'

interface KovalInspectorDrawerProps {
  project: ProjectItem | null
  onClose: () => void
}

function resolvePreview(path: string): string | null {
  const name = path.trim().split('/').pop()
  return name ? `./assets/projects/${name}` : null
}

export const KovalInspectorDrawer: React.FC<KovalInspectorDrawerProps> = ({
  project,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!project) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [project, onClose])

  if (!project) return null

  const previewSrc = resolvePreview(project.image_path)

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}${window.location.pathname}?work=${encodeURIComponent(
        project.id,
      )}`
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLink(true)
      window.setTimeout(() => setCopiedLink(false), 1800)
    } catch {
      // Clipboard unavailable in restricted contexts
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      className="fixed inset-0 z-[90] flex items-stretch justify-start bg-[#111110]/40"
      onClick={onClose}
    >
      <div
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="flex h-full w-full max-w-[540px] flex-col overflow-y-auto overscroll-contain border-r border-[#111110] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#111110]/15 bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="koval-chip">
            <span className="koval-chip-prefix">
              <ArrowLeft className="h-3 w-3" />
            </span>
            <span className="koval-chip-label">close</span>
          </button>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCopyLink} className="koval-chip">
              <span className="koval-chip-prefix">
                {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </span>
              <span className="koval-chip-label">{copiedLink ? 'copied' : 'copy-link'}</span>
            </button>
            <a
              href={project.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="koval-chip"
            >
              <span className="koval-chip-prefix">/</span>
              <span className="koval-chip-label">github</span>
            </a>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="space-y-6 p-6 sm:p-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.08em] text-[#656561]">
              {project.category}
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[#111110]">
              {project.name}
            </h2>
            <p className="mt-1.5 text-sm text-[#3A3A38]">{project.tagline}</p>
          </div>

          {previewSrc && (
            <div className="border border-[#111110]/20 bg-[#111110] p-3">
              <img src={previewSrc} alt={project.name} className="max-h-60 w-full object-contain" />
            </div>
          )}

          <p className="text-sm leading-relaxed text-[#3A3A38]">{project.description}</p>

          <div className="border border-[#111110]/20 bg-[#F4F4F2] p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#656561]">
              CONTRIBUTION
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#111110]">
              {project.my_contribution}
            </p>
          </div>

          {project.key_features.length > 0 && (
            <ul className="space-y-2 border-t border-[#111110]/15 pt-4">
              {project.key_features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-xs leading-relaxed text-[#3A3A38]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#111110]" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2 border-t border-[#111110]/15 pt-4">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="border border-[#111110]/25 px-2.5 py-1 font-mono text-xs text-[#111110]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
