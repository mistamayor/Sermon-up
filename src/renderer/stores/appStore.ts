import { create } from 'zustand'
import type {
  QueueItem,
  ScripturePassage,
  AudioDevice,
  TranscriptSegment,
  AppSettings,
  QueueItemStatus,
} from '../../shared/types'

interface AppState {
  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void

  // System Status
  isOnline: boolean
  sttLatency: number
  isListening: boolean
  setSystemStatus: (status: Partial<{ isOnline: boolean; sttLatency: number; isListening: boolean }>) => void

  // Audio
  audioDevices: AudioDevice[]
  selectedDeviceId: string | null
  audioLevels: { rms: number; peak: number }
  setAudioDevices: (devices: AudioDevice[]) => void
  setSelectedDevice: (deviceId: string | null) => void
  setAudioLevels: (levels: { rms: number; peak: number }) => void

  // Transcription
  transcripts: TranscriptSegment[]
  addTranscript: (segment: TranscriptSegment) => void
  clearTranscripts: () => void

  // Queue
  queue: QueueItem[]
  addToQueue: (item: QueueItem) => void
  updateQueueItem: (id: string, status: QueueItemStatus) => void
  removeFromQueue: (id: string) => void
  clearQueue: () => void

  // Staging & Projection
  stagedContent: ScripturePassage | null
  currentContent: ScripturePassage | null
  isBlackout: boolean
  isFrozen: boolean
  stageContent: (content: ScripturePassage | null) => void
  showContent: () => void
  clearScreen: () => void
  setBlackout: (enabled: boolean) => void
  setFrozen: (enabled: boolean) => void

  // History
  history: ScripturePassage[]
  addToHistory: (passage: ScripturePassage) => void

  // Translation
  selectedTranslation: string
  setSelectedTranslation: (code: string) => void

  // Settings
  settings: AppSettings | null
  setSettings: (settings: AppSettings) => void

  // Mode
  mode: 'moderated' | 'auto-pilot'
  setMode: (mode: 'moderated' | 'auto-pilot') => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // System Status
  isOnline: true,
  sttLatency: 0,
  isListening: false,
  setSystemStatus: (status) =>
    set((state) => ({
      ...state,
      ...status,
    })),

  // Audio
  audioDevices: [],
  selectedDeviceId: null,
  audioLevels: { rms: 0, peak: 0 },
  setAudioDevices: (devices) => set({ audioDevices: devices }),
  setSelectedDevice: (deviceId) => set({ selectedDeviceId: deviceId }),
  setAudioLevels: (levels) => set({ audioLevels: levels }),

  // Transcription
  transcripts: [],
  addTranscript: (segment) =>
    set((state) => ({
      transcripts: [...state.transcripts.slice(-50), segment], // Keep last 50
    })),
  clearTranscripts: () => set({ transcripts: [] }),

  // Queue
  queue: [],
  addToQueue: (item) =>
    set((state) => ({
      queue: [item, ...state.queue],
    })),
  updateQueueItem: (id, status) =>
    set((state) => ({
      queue: state.queue.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })),
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
  clearQueue: () => set({ queue: [] }),

  // Staging & Projection
  stagedContent: null,
  currentContent: null,
  isBlackout: false,
  isFrozen: false,
  stageContent: (content) => set({ stagedContent: content }),
  showContent: () => {
    const { stagedContent, currentContent, history, addToHistory } = get()
    if (stagedContent) {
      if (currentContent) {
        addToHistory(currentContent)
      }
      set({ currentContent: stagedContent, stagedContent: null })
      // Notify main process
      window.electronAPI?.updateProjection(stagedContent)
    }
  },
  clearScreen: () => {
    const { currentContent, addToHistory } = get()
    if (currentContent) {
      addToHistory(currentContent)
    }
    set({ currentContent: null })
    window.electronAPI?.updateProjection(null)
  },
  setBlackout: (enabled) => {
    set({ isBlackout: enabled })
    window.electronAPI?.setBlackout(enabled)
  },
  setFrozen: (enabled) => set({ isFrozen: enabled }),

  // History
  history: [],
  addToHistory: (passage) =>
    set((state) => ({
      history: [passage, ...state.history.slice(0, 49)], // Keep last 50
    })),

  // Translation
  selectedTranslation: 'KJV',
  setSelectedTranslation: (code) => set({ selectedTranslation: code }),

  // Settings
  settings: null,
  setSettings: (settings) => set({ settings }),

  // Mode
  mode: 'moderated',
  setMode: (mode) => set({ mode }),
}))
