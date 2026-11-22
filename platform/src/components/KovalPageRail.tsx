import React from 'react'

interface KovalPageRailProps {
  activeSectionId: string
  overDarkFooter: boolean
  onNavigate: (sectionId: string) => void
}

const RAIL_POINTS = [
  { id: 'top', label: 'Top' },
  { id: 'work', label: 'Selected Work' },
  { id: 'credentials', label: 'Verified Credentials' },
  { id: 'journey', label: 'Career & Education' },
  { id: 'contact', label: 'Contact' },
]

export const KovalPageRail: React.FC<KovalPageRailProps> = ({
  activeSectionId,
  overDarkFooter,
  onNavigate,
}) => {
  return (
    <nav
      aria-label="On this page"
      className="fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
    >
      {RAIL_POINTS.map((point) => {
        const active = activeSectionId === point.id
        const borderClass = overDarkFooter ? 'border-white/70' : 'border-[#111110]/45'
        const activeClass = overDarkFooter
          ? 'border-white bg-white'
          : 'border-[#111110] bg-[#111110]'

        return (
          <button
            key={point.id}
            type="button"
            title={point.label}
            aria-label={point.label}
            aria-current={active ? 'location' : undefined}
            onClick={() => onNavigate(point.id)}
            className={`h-2.5 w-2.5 border transition-colors cursor-pointer ${
              active ? activeClass : `${borderClass} bg-transparent`
            }`}
          />
        )
      })}
    </nav>
  )
}
