import React, { useState } from 'react'
import { useAppStore } from '../stores/appStore'
import LivePreview from '../components/LivePreview'
import ApprovalQueue from '../components/ApprovalQueue'
import TranscriptPanel from '../components/TranscriptPanel'
import QuickSelect from '../components/QuickSelect'

export default function LiveProjection() {
  const {
    currentContent,
    stagedContent,
    isBlackout,
    isFrozen,
    setBlackout,
    setFrozen,
    showContent,
    clearScreen,
    selectedTranslation,
    setSelectedTranslation,
    queue,
  } = useAppStore()

  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="flex flex-1 overflow-hidden h-full bg-[#0b0e14]">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-4 md:p-6 gap-6 overflow-y-auto">
        {/* Live Output Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-red-500 animate-pulse filled"
                  style={{ fontSize: '18px' }}
                >
                  fiber_manual_record
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                  Live Output (Active)
                </h3>
              </div>
              {currentContent && (
                <div className="hidden md:flex items-center text-sm font-medium bg-surface-dark rounded-md border border-border-dark overflow-hidden shadow-sm">
                  <button className="px-3 py-1.5 hover:bg-slate-800 border-r border-border-dark transition-colors">
                    {currentContent.reference.book}
                  </button>
                  <button className="px-3 py-1.5 hover:bg-slate-800 border-r border-border-dark transition-colors">
                    {currentContent.reference.chapter}
                  </button>
                  <button className="px-3 py-1.5 hover:bg-slate-800 transition-colors">
                    {currentContent.reference.verseStart || '1'}
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3 text-xs font-medium text-text-secondary">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">aspect_ratio</span>
                1920x1080
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">speed</span>
                60fps
              </span>
            </div>
          </div>

          {/* Preview Window */}
          <LivePreview content={currentContent} />
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-4 gap-4">
          <button
            onClick={() => setBlackout(!isBlackout)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all group shadow-sm ${
              isBlackout
                ? 'bg-red-500/10 border-red-500/50 text-red-500'
                : 'bg-surface-dark border-border-dark hover:border-red-500/50 hover:bg-red-500/5'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                isBlackout ? '' : 'text-text-secondary group-hover:text-red-500'
              } transition-colors`}
              style={{ fontSize: '24px' }}
            >
              block
            </span>
            <span
              className={`text-xs font-bold ${
                isBlackout ? '' : 'text-text-secondary group-hover:text-red-500'
              }`}
            >
              Blackout
            </span>
          </button>
          <button
            onClick={() => setFrozen(!isFrozen)}
            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all group shadow-sm ${
              isFrozen
                ? 'bg-blue-500/10 border-blue-500/50 text-blue-500'
                : 'bg-surface-dark border-border-dark hover:border-blue-500/50 hover:bg-blue-500/5'
            }`}
          >
            <span
              className={`material-symbols-outlined ${
                isFrozen ? '' : 'text-text-secondary group-hover:text-blue-500'
              } transition-colors`}
              style={{ fontSize: '24px' }}
            >
              ac_unit
            </span>
            <span
              className={`text-xs font-bold ${
                isFrozen ? '' : 'text-text-secondary group-hover:text-blue-500'
              }`}
            >
              Freeze
            </span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-surface-dark border border-border-dark hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group shadow-sm">
            <span
              className="material-symbols-outlined text-text-secondary group-hover:text-amber-500 transition-colors"
              style={{ fontSize: '24px' }}
            >
              branding_watermark
            </span>
            <span className="text-xs font-bold text-text-secondary group-hover:text-amber-500">
              Logo
            </span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 ring-1 ring-emerald-500/20 transition-all group shadow-sm">
            <span
              className="material-symbols-outlined text-emerald-500 filled"
              style={{ fontSize: '24px' }}
            >
              image
            </span>
            <span className="text-xs font-bold text-emerald-500">Theme</span>
          </button>
        </div>

        {/* Live Transcription */}
        <TranscriptPanel />
      </main>

      {/* Right Sidebar */}
      <aside className="w-[400px] bg-[#111318] border-l border-border-dark flex flex-col shrink-0 z-10 shadow-xl">
        {/* Translation Selector */}
        <div className="p-4 border-b border-border-dark bg-surface-darker">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Bible Translation
            </h3>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-8 h-4 bg-slate-700 peer-checked:bg-indigo-500 rounded-full after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              <span className="ml-2 text-[10px] font-bold text-text-secondary peer-checked:text-indigo-500 uppercase">
                Auto-Switch
              </span>
            </label>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedTranslation}
              onChange={(e) => setSelectedTranslation(e.target.value)}
              className="flex-1 pl-3 pr-8 py-2 text-sm font-semibold rounded-lg bg-surface-dark border border-border-dark text-white focus:ring-primary focus:border-primary cursor-pointer appearance-none shadow-sm"
            >
              <option value="KJV">King James Version (KJV)</option>
              <option value="NIV">New International Version (NIV)</option>
              <option value="ESV">English Standard Version (ESV)</option>
              <option value="NKJV">New King James Version (NKJV)</option>
            </select>
            <button className="p-2 rounded-lg bg-surface-dark border border-border-dark hover:border-primary text-text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                refresh
              </span>
            </button>
          </div>
        </div>

        {/* Approval Queue */}
        <ApprovalQueue />

        {/* Manual Search & Quick Select */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#111318]">
          <div className="p-4 pb-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  search
                </span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-10 rounded-lg border-border-dark bg-surface-dark text-sm text-white placeholder-text-secondary focus:ring-primary focus:border-primary shadow-sm"
                placeholder="Search verse manually..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary bg-slate-800 border border-border-dark rounded">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <QuickSelect searchQuery={searchQuery} />
        </div>
      </aside>
    </div>
  )
}
