import React from 'react'
import { RotateCcw } from 'lucide-react'
import type { StoryChapter } from './EditorialTopBar'

interface EditorialFlybarProps {
  visible: boolean
  activeChapter: StoryChapter
  totalChapters: number
  onOpenIndex: () => void
  onBackToPortrait: () => void
}

export const EditorialFlybar: React.FC<EditorialFlybarProps> = ({
  visible,
  activeChapter,
  totalChapters,
  onOpenIndex,
  onBackToPortrait,
}) => {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 transition-all duration-300 sm:px-6 lg:px-8 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
        {/* Bottom-left Active Chapter Readout */}
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={onOpenIndex}
          className="pointer-events-auto inline-flex items-baseline gap-2.5 rounded-full border border-slate-200/90 bg-white/92 px-4 py-2 text-left shadow-lg backdrop-blur-xl transition hover:border-blue-400 cursor-pointer"
        >
          <span className="font-editorial text-xl italic leading-none text-blue-600">
            {activeChapter.index}
          </span>
          <span className="font-editorial text-lg italic leading-none text-slate-950">
            {activeChapter.title}
          </span>
          <span className="hidden font-mono text-[11px] text-slate-500 sm:inline">
            · {activeChapter.subtitle}
          </span>
        </button>

        {/* Bottom-right Progress Counter & Back-to-Portrait Pill */}
        <div className="pointer-events-auto flex items-center gap-3">
          <span className="hidden rounded-full border border-slate-200/80 bg-white/88 px-3 py-1.5 font-mono text-[11px] text-slate-600 shadow-xs backdrop-blur-md md:inline-block">
            {activeChapter.id === 'skills-hub'
              ? 'Annex · AI Skills Hub'
              : `${activeChapter.index} of 0${totalChapters} · Story`}
          </span>
          <button
            type="button"
            tabIndex={visible ? 0 : -1}
            onClick={onBackToPortrait}
            className="inline-flex items-center gap-2 rounded-full border border-slate-950 bg-slate-950 px-4 py-2 font-sans text-xs font-medium text-white shadow-lg transition hover:border-blue-600 hover:bg-blue-600 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Back to portrait</span>
          </button>
        </div>
      </div>
    </div>
  )
}
