import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'
import LivePreview from '../components/LivePreview'
import SearchBar from '../components/SearchBar'

export default function Dashboard() {
  const navigate = useNavigate()
  const { history, currentContent, sttLatency, isOnline } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Sample suggestions for demo
  const suggestions = [
    {
      reference: 'Isaiah 41:10',
      text: '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."',
    },
    {
      reference: 'Matthew 11:28',
      text: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8 overflow-y-auto h-full">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Sunday Morning Service
          </h1>
          <p className="text-text-secondary">
            Manage live projection and AI scripture search.
          </p>
        </div>

        {/* Top Section: Live Preview & Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Output Card */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 filled" style={{ fontSize: '16px' }}>
                  fiber_manual_record
                </span>
                Live Output
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded bg-surface-dark border border-border-dark text-xs font-medium text-text-secondary hover:text-white transition-colors">
                  Clear Screen
                </button>
                <button className="px-3 py-1.5 rounded bg-surface-dark border border-border-dark text-xs font-medium text-text-secondary hover:text-white transition-colors">
                  Blackout
                </button>
              </div>
            </div>

            <LivePreview content={currentContent} />
          </div>

          {/* System Stats */}
          <div className="flex flex-col gap-4 h-full">
            <h3 className="text-lg font-semibold text-white">System Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 h-full">
              <div className="bg-surface-dark border border-border-dark p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1">AI Latency</p>
                  <p className="text-white text-2xl font-bold">{sttLatency}ms</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">speed</span>
                </div>
              </div>
              <div className="bg-surface-dark border border-border-dark p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1">Projector Status</p>
                  <p className="text-green-400 text-2xl font-bold">
                    {isOnline ? 'Connected' : 'Offline'}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <span className="material-symbols-outlined">videocam</span>
                </div>
              </div>
              <div className="bg-surface-dark border border-border-dark p-5 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm font-medium mb-1">Network</p>
                  <p className="text-white text-2xl font-bold">Excellent</p>
                </div>
                <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <span className="material-symbols-outlined">signal_cellular_alt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Search & Quick Actions */}
        <div className="flex flex-col gap-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Ask AI to find a verse about hope and strength..."
          />

          {/* Quick Modes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="h-12 bg-surface-dark border border-border-dark hover:border-primary/50 hover:bg-surface-dark/80 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                waving_hand
              </span>
              Welcome Slide
            </button>
            <button
              onClick={() => navigate('/live')}
              className="h-12 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">mic_external_on</span>
              Sermon Mode
            </button>
            <button className="h-12 bg-surface-dark border border-border-dark hover:border-primary/50 hover:bg-surface-dark/80 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                music_note
              </span>
              Worship Lyrics
            </button>
            <button className="h-12 bg-surface-dark border border-border-dark hover:border-primary/50 hover:bg-surface-dark/80 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 group">
              <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                campaign
              </span>
              Announcements
            </button>
          </div>
        </div>

        {/* Bottom Section: History & Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
          {/* Recent History */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">History</h3>
              <button className="text-xs text-primary font-medium hover:underline">
                View All
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {history.length === 0 ? (
                <div className="p-4 text-center text-text-secondary text-sm">
                  No recent history
                </div>
              ) : (
                history.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/30 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">
                        {item.displayReference}
                      </span>
                      <span className="text-text-secondary text-xs truncate max-w-[200px]">
                        {item.text.substring(0, 40)}...
                      </span>
                    </div>
                    <button className="size-8 rounded flex items-center justify-center hover:bg-primary/10 text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <span className="material-symbols-outlined text-lg">play_arrow</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">
                  auto_awesome
                </span>
                Suggested for "Comfort"
              </h3>
              <div className="flex gap-2">
                <button className="p-1 rounded hover:bg-surface-dark text-text-secondary">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-1 rounded hover:bg-surface-dark text-text-secondary">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-surface-dark border border-border-dark rounded-xl p-5 flex flex-col justify-between gap-4 hover:border-primary/50 transition-colors h-full"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-1 rounded">
                        {suggestion.reference}
                      </span>
                      <button className="text-text-secondary hover:text-white">
                        <span className="material-symbols-outlined text-lg">favorite</span>
                      </button>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{suggestion.text}</p>
                  </div>
                  <button className="w-full py-2 bg-white/5 hover:bg-primary hover:text-white text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group">
                    Project Now
                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
