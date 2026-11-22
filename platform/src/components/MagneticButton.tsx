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
    'relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium tracking-tight transition-[border-color,color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC] select-none cursor-pointer'

  const variantStyles =
    variant === 'primary'
      ? 'border border-slate-950 bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] hover:border-blue-600 hover:text-white'
      : variant === 'secondary'
        ? 'border border-blue-200 bg-blue-50 text-blue-800 shadow-[0_4px_14px_rgba(37,99,235,0.08)] hover:border-blue-600 hover:text-white'
        : 'border border-slate-200 bg-white/95 text-slate-800 shadow-xs hover:border-slate-900 hover:text-slate-950'

  const fillStyles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600'
      : variant === 'secondary'
        ? 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600'
        : 'bg-slate-100'

  const style: React.CSSProperties = {
    transform: `translate3d(${offset.x.toFixed(1)}px, ${offset.y.toFixed(1)}px, 0)`,
    transition: hovered
      ? 'transform 0.16s cubic-bezier(0.22, 1, 0.36, 1)'
      : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
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
