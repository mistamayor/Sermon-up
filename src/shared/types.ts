// Scripture Types
export interface Translation {
  id: number
  code: string
  name: string
  language: string
  copyright: string
}

export interface Book {
  id: number
  translationId: number
  name: string
  abbreviation: string
  testament: 'OT' | 'NT'
  position: number
}

export interface BookAlias {
  id: number
  bookId: number
  alias: string
  isSttCorrection: boolean
}

export interface Verse {
  id: number
  bookId: number
  chapter: number
  verse: number
  text: string
}

export interface ScriptureReference {
  book: string
  chapter: number
  verseStart?: number
  verseEnd?: number
  translation: string
  bookFromContext?: boolean  // True when book was inferred from chapter context
}

export interface ScripturePassage {
  reference: ScriptureReference
  displayReference: string
  text: string
  verses: Verse[]
}

// Intent Classification Types
export type IntentType =
  | 'explicit_display'    // Clear request to read/display
  | 'implicit_display'    // Likely reading but phrased casually
  | 'contextual_reference' // Mentioning without display intent
  | 'rhetorical_thematic' // Scriptural language without reference

export type ActionType =
  | 'IGNORE'
  | 'SUGGEST'
  | 'QUEUE'
  | 'QUEUE_WITH_WARNING'

export interface IntentClassification {
  type: IntentType
  confidence: number
  signals: string[]
}

// Queue Types
export type QueueItemStatus =
  | 'pending'
  | 'confirmed'
  | 'ignored'
  | 'staged'
  | 'displayed'

export interface QueueItem {
  id: string
  reference: ScriptureReference
  displayReference: string
  text: string
  source: 'voice' | 'manual'
  action: ActionType
  status: QueueItemStatus
  createdAt: Date
  confidence: number
  intentType?: IntentType
}

// Pastor Profile Types
export type AggressivenessLevel = 'conservative' | 'balanced' | 'responsive'
export type VerseStyle = 'spoken' | 'numeric'

export interface PastorProfile {
  id: string
  name: string
  wakePhrases: string[]
  ignorePhrases: string[]
  aggressiveness: AggressivenessLevel
  contextTimeoutSeconds: number
  verseStyle: VerseStyle
}

// Audio Types
export interface AudioDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput'
}

export interface AudioState {
  isCapturing: boolean
  selectedDevice: string | null
  rmsLevel: number
  peakLevel: number
}

// STT Types
export interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  confidence: number
  isFinal: boolean
}

// Application State Types
export interface AppSettings {
  audio: {
    deviceId: string | null
    gain: number
    silenceThreshold: number
  }
  stt: {
    modelPath: string
    language: string
    windowDuration: number
    processInterval: number
  }
  rules: {
    aggressiveness: AggressivenessLevel
    cooldownSeconds: number
    contextTimeoutSeconds: number
    activeProfileId: string | null
  }
  display: {
    outputDevice: string | null
    fontSize: number
    theme: 'dark' | 'light'
    fontFamily: string
    fontColor: string
    backgroundColor: string
  }
  logging: {
    enabled: boolean
    retentionDays: number
    path: string
  }
}

// Projection Types
export interface ProjectionState {
  isLive: boolean
  currentContent: ScripturePassage | null
  stagedContent: ScripturePassage | null
  isBlackout: boolean
  isFrozen: boolean
}

// System Status Types
export interface SystemStatus {
  sttLatency: number
  isConnected: boolean
  networkQuality: 'excellent' | 'good' | 'poor' | 'offline'
  isListening: boolean
}

// IPC Channel Types
export type IpcChannels = {
  // Audio
  'audio:get-devices': () => AudioDevice[]
  'audio:start-capture': (deviceId: string) => void
  'audio:stop-capture': () => void
  'audio:levels': (levels: { rms: number; peak: number }) => void

  // STT
  'stt:transcript': (segment: TranscriptSegment) => void
  'stt:status': (status: { isProcessing: boolean; latency: number }) => void

  // Scripture
  'scripture:search': (query: string) => ScripturePassage[]
  'scripture:get-passage': (ref: ScriptureReference) => ScripturePassage | null
  'scripture:get-translations': () => Translation[]

  // Queue
  'queue:add': (item: QueueItem) => void
  'queue:update': (id: string, status: QueueItemStatus) => void
  'queue:remove': (id: string) => void

  // Projection
  'projection:stage': (passage: ScripturePassage) => void
  'projection:show': () => void
  'projection:clear': () => void
  'projection:blackout': (enabled: boolean) => void

  // Settings
  'settings:get': () => AppSettings
  'settings:update': (settings: Partial<AppSettings>) => void

  // Profiles
  'profiles:get-all': () => PastorProfile[]
  'profiles:save': (profile: PastorProfile) => void
  'profiles:delete': (id: string) => void
}
