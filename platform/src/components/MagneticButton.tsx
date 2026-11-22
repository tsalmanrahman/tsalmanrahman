import React, { useRef, useState } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  target?: string
  rel?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  className?: string
  ariaLabel?: string
  type?: 'button' | 'submit'
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  onClick,
  href,
  target,
  rel,
  variant = 'primary',
  className = '',
  ariaLabel,
  type = 'button',
}) => {
  const ref = useRef<HTMLElement | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.24
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.28
    setOffset({ x, y })
  }

  const handleMouseLeave = () => {
    setHovered(false)
    setOffset({ x: 0, y: 0 })
  }

  const baseStyles =
    'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-[border-color,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060A13] select-none cursor-pointer'

  const variantStyles =
    variant === 'primary'
      ? 'border border-cyan-400/50 bg-cyan-400/15 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.18)] hover:border-cyan-300 hover:text-slate-950'
      : variant === 'secondary'
        ? 'border border-amber-400/40 bg-amber-400/10 text-amber-100 hover:border-amber-300 hover:text-slate-950'
        : 'border border-slate-700/80 bg-[#0B1220]/80 text-slate-200 hover:border-cyan-400/50 hover:text-white'

  const fillStyles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-300'
      : variant === 'secondary'
        ? 'bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300'
        : 'bg-slate-800/90'

  const style: React.CSSProperties = {
    transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0)`,
    transition: hovered ? 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
  }

  const content = (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 origin-bottom rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${fillStyles} ${
          hovered ? 'scale-y-100' : 'scale-y-0'
        }`}
      />
      <span
        className="relative z-10 inline-flex items-center gap-2 transition-transform duration-300"
        style={{
          transform: hovered
            ? `translate3d(${(offset.x * 0.25).toFixed(1)}px, ${(offset.y * 0.25).toFixed(1)}px, 0)`
            : 'translate3d(0,0,0)',
        }}
      >
        {children}
      </span>
    </>
  )

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
        aria-label={ariaLabel}
        style={style}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`${baseStyles} ${variantStyles} ${className}`}
      >
        {content}
      </a>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {content}
    </button>
  )
}
