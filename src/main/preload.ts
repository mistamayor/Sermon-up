import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Scripture
  searchScripture: (query: string) =>
    ipcRenderer.invoke('scripture:search', query),
  getPassage: (ref: unknown) =>
    ipcRenderer.invoke('scripture:get-passage', ref),
  getTranslations: () =>
    ipcRenderer.invoke('scripture:get-translations'),
  getBooks: (translationId: number) =>
    ipcRenderer.invoke('scripture:get-books', translationId),

  // Audio
  getAudioDevices: () =>
    ipcRenderer.invoke('audio:get-devices'),
  startAudioCapture: (deviceId: string) =>
    ipcRenderer.send('audio:start-capture', deviceId),
  stopAudioCapture: () =>
    ipcRenderer.send('audio:stop-capture'),
  sendAudioLevels: (levels: { rms: number; peak: number }) =>
    ipcRenderer.send('audio:levels', levels),

  // Projection
  openProjection: () =>
    ipcRenderer.send('projection:open'),
  closeProjection: () =>
    ipcRenderer.send('projection:close'),
  updateProjection: (content: unknown) =>
    ipcRenderer.send('projection:update', content),
  setBlackout: (enabled: boolean) =>
    ipcRenderer.send('projection:blackout', enabled),

  // Settings
  getSettings: () =>
    ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: unknown) =>
    ipcRenderer.invoke('settings:update', settings),

  // Window controls
  minimizeWindow: () =>
    ipcRenderer.send('window:minimize'),
  maximizeWindow: () =>
    ipcRenderer.send('window:maximize'),
  closeWindow: () =>
    ipcRenderer.send('window:close'),

  // Event listeners
  onProjectionContent: (callback: (content: unknown) => void) => {
    ipcRenderer.on('projection:content', (_event, content) => callback(content))
    return () => {
      ipcRenderer.removeAllListeners('projection:content')
    }
  },
  onProjectionBlackout: (callback: (enabled: boolean) => void) => {
    ipcRenderer.on('projection:blackout', (_event, enabled) => callback(enabled))
    return () => {
      ipcRenderer.removeAllListeners('projection:blackout')
    }
  },
  onTranscript: (callback: (segment: unknown) => void) => {
    ipcRenderer.on('stt:transcript', (_event, segment) => callback(segment))
    return () => {
      ipcRenderer.removeAllListeners('stt:transcript')
    }
  },
  onQueueAdd: (callback: (item: unknown) => void) => {
    ipcRenderer.on('queue:add', (_event, item) => callback(item))
    return () => {
      ipcRenderer.removeAllListeners('queue:add')
    }
  },
})

// Type declarations for the exposed API
export interface ElectronAPI {
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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
