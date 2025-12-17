import React, { useState } from 'react'
import { useAppStore } from '../stores/appStore'

type SettingsTab = 'general' | 'display' | 'typography' | 'backgrounds' | 'ai' | 'schedule' | 'loops'

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: 'general', label: 'General Settings', icon: 'tune' },
  { id: 'display', label: 'Display & Output', icon: 'monitor' },
  { id: 'typography', label: 'Typography', icon: 'format_size' },
  { id: 'backgrounds', label: 'Backgrounds', icon: 'wallpaper' },
  { id: 'ai', label: 'AI Behaviors', icon: 'psychology' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [fontSize, setFontSize] = useState(64)
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontWeight, setFontWeight] = useState('Bold')
  const [fontColor, setFontColor] = useState('#FFFFFF')
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true)
  const [autoVerseDetection, setAutoVerseDetection] = useState(true)
  const [motionBackgrounds, setMotionBackgrounds] = useState(false)

  const themes = [
    { id: 'cosmic', name: 'Cosmic Night', active: true },
    { id: 'morning', name: 'Morning Grace', active: false },
    { id: 'modern', name: 'Modern Geo', active: false },
  ]

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Settings Navigation */}
      <div className="w-[240px] bg-background-dark border-r border-border-dark p-4 flex flex-col gap-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-3 mb-2">
          Configuration
        </h3>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-text-secondary hover:bg-surface-dark hover:text-white border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {tab.icon}
            </span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}

        <div className="mt-4 pt-4 border-t border-border-dark">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-3 mb-2">
            Automation
          </h3>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors w-full text-left">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              calendar_month
            </span>
            <span className="text-sm font-medium">Schedule</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:bg-surface-dark hover:text-white transition-colors w-full text-left">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              repeat
            </span>
            <span className="text-sm font-medium">Loops & Playlists</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Projection Settings</h1>
              <p className="text-text-secondary mt-1">
                Configure real-time output, themes, and AI triggers.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg bg-surface-dark border border-border-dark text-white font-medium hover:bg-border-dark transition-colors">
                Discard
              </button>
              <button className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          {/* Live Output Preview */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-red-500 filled" style={{ fontSize: '14px' }}>
                fiber_manual_record
              </span>
              <span className="text-sm font-bold uppercase tracking-wider text-text-secondary">
                Live Output Preview
              </span>
              <span className="text-xs text-text-secondary ml-auto">1920 × 1080 • 16:9</span>
            </div>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border-dark shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <p
                  className="text-white drop-shadow-lg leading-snug max-w-4xl"
                  style={{
                    fontSize: `${fontSize / 2}px`,
                    fontFamily,
                    fontWeight: fontWeight === 'Bold' ? 700 : 400,
                    color: fontColor,
                  }}
                >
                  "For God so loved the world that he gave his one and only Son..."
                </p>
                <p className="text-white/70 mt-6 text-lg font-medium tracking-wide">
                  JOHN 3:16
                </p>
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">format_size</span>
                  Typography
                </h3>
                <button className="text-xs text-primary hover:underline">Reset Default</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-2 block">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background-dark border border-border-dark text-white focus:ring-primary focus:border-primary"
                  >
                    <option value="Inter">Inter (Sans-serif)</option>
                    <option value="Georgia">Georgia (Serif)</option>
                    <option value="Roboto">Roboto (Sans-serif)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-text-secondary mb-2 flex items-center justify-between">
                    <span>Font Size</span>
                    <span className="text-white">{fontSize}px</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-sm">Aa</span>
                    <input
                      type="range"
                      min="32"
                      max="128"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 h-2 bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-text-secondary text-lg">Aa</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary mb-2 block">
                      Color
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background-dark border border-border-dark">
                      <div
                        className="w-6 h-6 rounded border border-border-dark"
                        style={{ backgroundColor: fontColor }}
                      />
                      <span className="text-white text-sm">{fontColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-text-secondary mb-2 block">
                      Weight
                    </label>
                    <select
                      value={fontWeight}
                      onChange={(e) => setFontWeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background-dark border border-border-dark text-white focus:ring-primary focus:border-primary"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Bold">Bold</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Theme */}
            <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">wallpaper</span>
                  Active Theme
                </h3>
                <button className="text-xs text-primary hover:underline">Browse All</button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      theme.active
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border-dark'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
                    {theme.active && (
                      <div className="absolute top-1 right-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        Active
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1">
                      <span className="text-[10px] text-white font-medium">{theme.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-text-secondary">
                  Transition Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Fade', 'Slide', 'Zoom'].map((style) => (
                    <button
                      key={style}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        style === 'Fade'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-background-dark text-text-secondary border border-border-dark hover:border-primary/50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Automation */}
          <div className="bg-surface-dark rounded-xl border border-border-dark p-6">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined">auto_awesome</span>
              AI Automation
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <input
                  type="checkbox"
                  checked={sentimentAnalysis}
                  onChange={(e) => setSentimentAnalysis(e.target.checked)}
                  className="mt-1 rounded border-border-dark bg-background-dark text-primary focus:ring-primary"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Sentiment Analysis</h4>
                  <p className="text-text-secondary text-xs mt-1">
                    Automatically adjusts background mood based on verse content (e.g., joyful vs. somber).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <input
                  type="checkbox"
                  checked={autoVerseDetection}
                  onChange={(e) => setAutoVerseDetection(e.target.checked)}
                  className="mt-1 rounded border-border-dark bg-background-dark text-primary focus:ring-primary"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Auto-Verse Detection</h4>
                  <p className="text-text-secondary text-xs mt-1">
                    Listens to the speaker audio and queues verses in real-time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-background-dark border border-border-dark">
                <input
                  type="checkbox"
                  checked={motionBackgrounds}
                  onChange={(e) => setMotionBackgrounds(e.target.checked)}
                  className="mt-1 rounded border-border-dark bg-background-dark text-primary focus:ring-primary"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">Motion Backgrounds Only</h4>
                  <p className="text-text-secondary text-xs mt-1">
                    Prioritize video backgrounds over static images for all slides.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
