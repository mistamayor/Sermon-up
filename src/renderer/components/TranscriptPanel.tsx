import React from 'react'
import { useAppStore } from '../stores/appStore'

export default function TranscriptPanel() {
  const { transcripts, isListening } = useAppStore()

  // Sample transcript for demo when no real transcripts
  const sampleTranscripts = [
    { id: '1', text: '...it is a time to reflect on the goodness that surrounds us every day. Even in the valley...', isFaded: true },
    { id: '2', text: 'We must hold onto the promises that have been given to us from the beginning.', isFaded: true },
    { id: '3', text: 'And as it says in', highlight: 'Jeremiah 29:11', rest: ', "For I know the plans I have for you," declares the Lord...', isHighlighted: true },
    { id: '4', text: 'plans to prosper you and not to harm you, plans to give you hope...', isPulsing: true },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '14px' }}>
              graphic_eq
            </span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
            Live Transcription
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">High Confidence</span>
          <button className="text-xs font-bold text-primary hover:underline">View History</button>
        </div>
      </div>

      <div className="flex-1 w-full rounded-xl bg-[#111318] border border-border-dark p-6 relative overflow-hidden shadow-inner group min-h-[200px]">
        {/* Listening Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-surface-dark rounded-md border border-border-dark z-10">
          {isListening ? (
            <>
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 bg-primary audio-bar h-2"></div>
                <div className="w-0.5 bg-primary audio-bar h-3"></div>
                <div className="w-0.5 bg-primary audio-bar h-1.5"></div>
              </div>
              <span className="text-[10px] font-bold text-text-secondary uppercase">Listening</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-text-secondary" style={{ fontSize: '14px' }}>
                mic_off
              </span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">Paused</span>
            </>
          )}
        </div>

        {/* Gradient Fade at Top */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#111318] to-transparent z-10 pointer-events-none"></div>

        {/* Transcript Content */}
        <div className="flex flex-col justify-end h-full gap-4 relative z-0">
          {transcripts.length > 0 ? (
            <div className="space-y-4">
              {transcripts.slice(-5).map((segment) => (
                <p key={segment.id} className="text-lg text-text-secondary font-medium">
                  {segment.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sampleTranscripts.map((item) => (
                <div key={item.id}>
                  {item.isHighlighted ? (
                    <div className="relative pl-4 border-l-4 border-amber-500/50">
                      <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                        {item.text}{' '}
                        <span className="text-amber-500 bg-amber-500/10 px-1 rounded mx-1">
                          {item.highlight}
                        </span>
                        {item.rest}
                      </p>
                      <div className="absolute -top-6 left-4 flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-lg shadow-amber-500/20 transform -translate-y-1 animate-bounce">
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                          search_check
                        </span>
                        Match Found
                      </div>
                    </div>
                  ) : (
                    <p
                      className={`text-lg font-medium ${
                        item.isPulsing
                          ? 'text-slate-600 animate-pulse'
                          : item.isFaded
                          ? 'text-slate-500'
                          : 'text-text-secondary'
                      }`}
                    >
                      {item.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
