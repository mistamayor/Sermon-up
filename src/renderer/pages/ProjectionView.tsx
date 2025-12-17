import React, { useState, useEffect } from 'react'
import type { ScripturePassage } from '../../shared/types'

/**
 * ProjectionView is the fullscreen view displayed on the secondary monitor/projector.
 * It receives content updates from the main window via IPC.
 */
export default function ProjectionView() {
  const [content, setContent] = useState<ScripturePassage | null>(null)
  const [isBlackout, setIsBlackout] = useState(false)

  useEffect(() => {
    // Listen for content updates from main process
    const unsubscribeContent = window.electronAPI?.onProjectionContent((newContent) => {
      setContent(newContent as ScripturePassage | null)
    })

    const unsubscribeBlackout = window.electronAPI?.onProjectionBlackout((enabled) => {
      setIsBlackout(enabled)
    })

    return () => {
      unsubscribeContent?.()
      unsubscribeBlackout?.()
    }
  }, [])

  // Blackout mode
  if (isBlackout) {
    return <div className="w-screen h-screen bg-black" />
  }

  // No content
  if (!content) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white/10 text-2xl font-medium">Sermon Up</div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />
        {/* Animated particles effect */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-16 text-center">
        <p className="text-white text-5xl md:text-6xl lg:text-7xl font-bold drop-shadow-2xl leading-tight max-w-6xl">
          "{content.text}"
        </p>
        <div className="mt-12 inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
          <p className="text-white text-2xl md:text-3xl font-semibold tracking-wide">
            {content.displayReference}
            <span className="text-white/60 ml-3 text-xl">
              ({content.reference.translation})
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
