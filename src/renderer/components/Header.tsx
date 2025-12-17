import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Control Center',
  '/live': 'Live Projection',
  '/scripture': 'Scripture Library',
  '/settings': 'Settings',
}

export default function Header() {
  const location = useLocation()
  const { isOnline, mode, setMode, isListening, selectedDeviceId } = useAppStore()

  const title = pageTitles[location.pathname] || 'Sermon Up'

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-dark bg-background-dark/50 backdrop-blur-md px-6 py-3 shrink-0 z-20 drag-region">
      {/* Left Section - Title */}
      <div className="flex items-center gap-4 text-white no-drag">
        <h2 className="text-lg font-bold leading-tight">{title}</h2>
      </div>

      {/* Center Section - Audio Source & Mode (visible on Live page) */}
      {location.pathname === '/live' && (
        <div className="hidden lg:flex items-center gap-4 no-drag">
          {/* Audio Source Indicator */}
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-surface-dark border border-border-dark">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>
              mic
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase text-text-secondary tracking-wider leading-none mb-0.5">
                Input Source
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[150px]">
                {selectedDeviceId ? 'Audio Device' : 'No Device Selected'}
              </span>
            </div>
            {isListening && (
              <div
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"
                title="Signal Detected"
              />
            )}
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-surface-dark rounded-full p-1 border border-border-dark">
            <button
              onClick={() => setMode('moderated')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === 'moderated'
                  ? 'bg-primary text-white shadow-md ring-2 ring-primary/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Moderated
            </button>
            <button
              onClick={() => setMode('auto-pilot')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                mode === 'auto-pilot'
                  ? 'bg-primary text-white shadow-md ring-2 ring-primary/20'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Auto-Pilot
            </button>
          </div>
        </div>
      )}

      {/* Right Section - Status & Actions */}
      <div className="flex flex-1 justify-end gap-4 items-center no-drag">
        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 bg-surface-dark px-3 py-1.5 rounded-lg border border-border-dark">
          <div
            className={`size-2 rounded-full ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-xs font-medium text-text-secondary">
            {isOnline ? 'System Online' : 'Offline'}
          </span>
        </div>

        {/* Live Indicator (on Live page) */}
        {location.pathname === '/live' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-500">Live</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button className="flex items-center justify-center rounded-lg size-10 bg-surface-dark hover:bg-border-dark text-white transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              notifications
            </span>
          </button>
          <button className="flex items-center justify-center rounded-lg size-10 bg-surface-dark hover:bg-border-dark text-white transition-colors">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              wifi
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
