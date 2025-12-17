import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'
import { ScriptureDatabase } from './database'
import { AudioCapture } from './audio'
import { RulesEngine } from './rules-engine'

// Global references
let mainWindow: BrowserWindow | null = null
let projectionWindow: BrowserWindow | null = null
let database: ScriptureDatabase | null = null
let audioCapture: AudioCapture | null = null
let rulesEngine: RulesEngine | null = null

const isDev = process.env.NODE_ENV === 'development'

function createMainWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const window = new BrowserWindow({
    width: Math.min(1600, width * 0.9),
    height: Math.min(1000, height * 0.9),
    minWidth: 1200,
    minHeight: 700,
    title: 'Sermon Up',
    backgroundColor: '#101622',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  // Load the app
  if (isDev) {
    window.loadURL('http://localhost:5173')
    window.webContents.openDevTools()
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  // Show window when ready
  window.once('ready-to-show', () => {
    window.show()
  })

  window.on('closed', () => {
    mainWindow = null
  })

  return window
}

function createProjectionWindow(): BrowserWindow {
  const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  const targetDisplay = externalDisplay || displays[0]

  const window = new BrowserWindow({
    x: targetDisplay.bounds.x,
    y: targetDisplay.bounds.y,
    width: targetDisplay.bounds.width,
    height: targetDisplay.bounds.height,
    frame: false,
    fullscreen: true,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  })

  // Load projection view
  if (isDev) {
    window.loadURL('http://localhost:5173/#/projection')
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'), {
      hash: '/projection',
    })
  }

  window.on('closed', () => {
    projectionWindow = null
  })

  return window
}

async function initializeServices(): Promise<void> {
  // Initialize database
  const userDataPath = app.getPath('userData')
  database = new ScriptureDatabase(path.join(userDataPath, 'scripture.db'))
  await database.initialize()

  // Initialize audio capture
  audioCapture = new AudioCapture()

  // Initialize rules engine
  rulesEngine = new RulesEngine(database)
}

function setupIpcHandlers(): void {
  // Scripture handlers
  ipcMain.handle('scripture:search', async (_event, query: string) => {
    if (!database) return []
    return database.searchScripture(query)
  })

  ipcMain.handle('scripture:get-passage', async (_event, ref) => {
    if (!database) return null
    return database.getPassage(ref)
  })

  ipcMain.handle('scripture:get-translations', async () => {
    if (!database) return []
    return database.getTranslations()
  })

  ipcMain.handle('scripture:get-books', async (_event, translationId: number) => {
    if (!database) return []
    return database.getBooks(translationId)
  })

  // Audio handlers
  ipcMain.handle('audio:get-devices', async () => {
    return []  // Will be populated from renderer process
  })

  ipcMain.on('audio:start-capture', (_event, deviceId: string) => {
    if (audioCapture) {
      audioCapture.start(deviceId)
    }
  })

  ipcMain.on('audio:stop-capture', () => {
    if (audioCapture) {
      audioCapture.stop()
    }
  })

  // Projection handlers
  ipcMain.on('projection:open', () => {
    if (!projectionWindow) {
      projectionWindow = createProjectionWindow()
    }
    projectionWindow.show()
  })

  ipcMain.on('projection:close', () => {
    if (projectionWindow) {
      projectionWindow.hide()
    }
  })

  ipcMain.on('projection:update', (_event, content) => {
    if (projectionWindow) {
      projectionWindow.webContents.send('projection:content', content)
    }
  })

  ipcMain.on('projection:blackout', (_event, enabled: boolean) => {
    if (projectionWindow) {
      projectionWindow.webContents.send('projection:blackout', enabled)
    }
  })

  // Settings handlers
  ipcMain.handle('settings:get', async () => {
    // Return default settings for now
    return {
      audio: {
        deviceId: null,
        gain: 1.0,
        silenceThreshold: 0.01,
      },
      stt: {
        modelPath: '',
        language: 'en',
        windowDuration: 5000,
        processInterval: 500,
      },
      rules: {
        aggressiveness: 'balanced',
        cooldownSeconds: 30,
        contextTimeoutSeconds: 20,
        activeProfileId: null,
      },
      display: {
        outputDevice: null,
        fontSize: 64,
        theme: 'dark',
        fontFamily: 'Inter',
        fontColor: '#ffffff',
        backgroundColor: '#000000',
      },
      logging: {
        enabled: true,
        retentionDays: 7,
        path: app.getPath('userData'),
      },
    }
  })

  // Window control handlers
  ipcMain.on('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.on('window:close', () => {
    mainWindow?.close()
  })
}

// App lifecycle
app.whenReady().then(async () => {
  await initializeServices()
  setupIpcHandlers()
  mainWindow = createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (audioCapture) {
    audioCapture.stop()
  }
  if (database) {
    database.close()
  }
})
