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

  // Event listeners - use named listeners for proper cleanup
  onProjectionContent: (callback: (content: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, content: unknown) => callback(content)
    ipcRenderer.on('projection:content', listener)
    return () => {
      ipcRenderer.removeListener('projection:content', listener)
    }
  },
  onProjectionBlackout: (callback: (enabled: boolean) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, enabled: boolean) => callback(enabled)
    ipcRenderer.on('projection:blackout', listener)
    return () => {
      ipcRenderer.removeListener('projection:blackout', listener)
    }
  },
  onTranscript: (callback: (segment: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, segment: unknown) => callback(segment)
    ipcRenderer.on('stt:transcript', listener)
    return () => {
      ipcRenderer.removeListener('stt:transcript', listener)
    }
  },
  onQueueAdd: (callback: (item: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, item: unknown) => callback(item)
    ipcRenderer.on('queue:add', listener)
    return () => {
      ipcRenderer.removeListener('queue:add', listener)
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
