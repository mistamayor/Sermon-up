import React, { useState, useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

// Countdown timer component for queue items
function CountdownBadge({ initialSeconds = 15, onExpire }: { initialSeconds?: number; onExpire?: () => void }) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onExpire])

  // Format as M:SS
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = `${minutes}:${secs.toString().padStart(2, '0')}`

  return (
    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500 text-white shadow-sm animate-pulse">
      <span className="material-symbols-outlined" style={{ fontSize: '10px' }}>
        timer
      </span>
      <span className="text-[10px] font-bold tabular-nums">{formatted}</span>
    </div>
  )
}

export default function ApprovalQueue() {
  const { queue, updateQueueItem, removeFromQueue, stageContent } = useAppStore()

  const pendingItems = queue.filter((item) => item.status === 'pending')

  const handleApprove = (item: typeof queue[0]) => {
    updateQueueItem(item.id, 'confirmed')
    stageContent({
      reference: item.reference,
      displayReference: item.displayReference,
      text: item.text,
      verses: [],
    })
  }

  const handleDismiss = (id: string) => {
    updateQueueItem(id, 'ignored')
    setTimeout(() => removeFromQueue(id), 500)
  }

  if (pendingItems.length === 0) {
    return (
      <div className="border-b border-border-dark bg-surface-darker/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            </span>
            Approval Queue
          </h3>
          <span className="text-[10px] font-bold text-text-secondary bg-surface-dark px-2 py-0.5 rounded border border-border-dark">
            Empty
          </span>
        </div>
        <div className="text-center py-6 text-text-secondary text-sm">
          <span className="material-symbols-outlined text-3xl opacity-30 mb-2 block">
            inbox
          </span>
          Waiting for scripture detection...
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col border-b border-border-dark bg-amber-50/5">
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Approval Queue
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-dark border border-amber-800 shadow-sm">
            <span className="material-symbols-outlined text-amber-500" style={{ fontSize: '14px' }}>
              timer
            </span>
            <select className="bg-transparent border-none p-0 pr-3 text-[10px] font-bold text-text-secondary focus:ring-0 cursor-pointer h-auto leading-none w-11">
              <option value="15">15s</option>
              <option value="30">30s</option>
              <option value="60">60s</option>
              <option value="off">Off</option>
            </select>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-800">
            Active
          </span>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-3">
        {pendingItems.map((item, index) => (
          <div
            key={item.id}
            className={`bg-surface-dark rounded-xl shadow-xl relative overflow-hidden ${
              index === 0
                ? 'border-2 border-amber-500/30 ring-1 ring-amber-500/20'
                : 'border border-border-dark opacity-60 hover:opacity-100'
            }`}
          >
            {index === 0 && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-amber-500/10 w-[40%] z-0 border-r border-amber-500/20 transition-all duration-1000 ease-linear"></div>
                <div className="p-2.5 flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-amber-400"
                      style={{ fontSize: '16px' }}
                    >
                      psychology
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                      Pending
                    </span>
                    <CountdownBadge
                      initialSeconds={15}
                      onExpire={() => handleDismiss(item.id)}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary">
                    Match {Math.round(item.confidence * 100)}%
                  </span>
                </div>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-bold text-white">{item.displayReference}</h4>
                <span className="text-[10px] font-bold text-text-secondary bg-slate-700 px-1.5 py-0.5 rounded border border-slate-600">
                  {item.reference.translation}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4 border-l-2 border-slate-700 pl-3 line-clamp-3">
                {item.text}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDismiss(item.id)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border-dark text-text-secondary hover:bg-slate-800 hover:text-red-400 text-xs font-bold transition-all group"
                >
                  <span
                    className="material-symbols-outlined group-hover:scale-110 transition-transform"
                    style={{ fontSize: '18px' }}
                  >
                    close
                  </span>
                  Dismiss
                </button>
                <button
                  onClick={() => handleApprove(item)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/25 text-xs font-bold transition-all group"
                >
                  <span
                    className="material-symbols-outlined group-hover:scale-110 transition-transform"
                    style={{ fontSize: '18px' }}
                  >
                    check
                  </span>
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
