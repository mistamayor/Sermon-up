/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    // Scripture
    searchScripture: (query: string) => Promise<unknown[]>
    getPassage: (ref: unknown) => Promise<unknown | null>
    getTranslations: () => Promise<unknown[]>
    getBooks: (translationId: number) => Promise<unknown[]>

    // Audio
    getAudioDevices: () => Promise<unknown[]>
    startAudioCapture: (deviceId: string) => void
    stopAudioCapture: () => void
    sendAudioLevels: (levels: { rms: number; peak: number }) => void

    // Projection
    openProjection: () => void
    closeProjection: () => void
    updateProjection: (content: unknown) => void
    setBlackout: (enabled: boolean) => void

    // Settings
    getSettings: () => Promise<unknown>
    updateSettings: (settings: unknown) => Promise<void>

    // Window controls
    minimizeWindow: () => void
    maximizeWindow: () => void
    closeWindow: () => void

    // Event listeners
    onProjectionContent: (callback: (content: unknown) => void) => () => void
    onProjectionBlackout: (callback: (enabled: boolean) => void) => () => void
    onTranscript: (callback: (segment: unknown) => void) => () => void
    onQueueAdd: (callback: (item: unknown) => void) => () => void
  }
}
