import React, { useRef, useState, useCallback, useEffect } from 'react'
import type { ScripturePassage } from '../../shared/types'

interface LivePreviewProps {
  content: ScripturePassage | null
  className?: string
}

export default function LivePreview({ content, className = '' }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Toggle fullscreen
  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (containerRef.current) {
          await containerRef.current.requestFullscreen()
        }
      } else {
        // Exit fullscreen
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-border-dark group ${className}`}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12 text-center">
        {content ? (
          <>
            <p className="text-white text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg leading-snug max-w-4xl">
              "{content.text}"
            </p>
            <p className="text-white/80 text-lg md:text-xl mt-6 font-medium tracking-wide">
              {content.displayReference}
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-text-secondary">
            <span className="material-symbols-outlined text-6xl opacity-30">
              slideshow
            </span>
            <p className="text-lg font-medium">No content on screen</p>
            <p className="text-sm">Stage a scripture to display it here</p>
          </div>
        )}
      </div>

      {/* Live Badge */}
      {content && (
        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-lg animate-pulse">
          Live
        </div>
      )}

      {/* Hover Controls */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleFullscreenToggle}
          className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          aria-pressed={isFullscreen}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
          </span>
        </button>
      </div>
    </div>
  )
}
