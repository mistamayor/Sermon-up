import { EventEmitter } from 'events'

export interface AudioLevels {
  rms: number
  peak: number
}

/**
 * AudioCapture handles audio input from the system.
 * In the Electron main process, we coordinate with the renderer
 * to capture audio from the Web Audio API.
 */
export class AudioCapture extends EventEmitter {
  private isCapturing: boolean = false
  private selectedDeviceId: string | null = null

  constructor() {
    super()
  }

  /**
   * Start audio capture from the specified device.
   * The actual capture happens in the renderer process using Web Audio API.
   */
  start(deviceId: string): void {
    this.selectedDeviceId = deviceId
    this.isCapturing = true
    this.emit('started', { deviceId })
  }

  /**
   * Stop audio capture.
   */
  stop(): void {
    this.isCapturing = false
    this.selectedDeviceId = null
    this.emit('stopped')
  }

  /**
   * Process audio levels from the renderer.
   */
  processLevels(levels: AudioLevels): void {
    if (this.isCapturing) {
      this.emit('levels', levels)
    }
  }

  /**
   * Process audio data from the renderer for STT.
   */
  processAudioData(audioData: Float32Array): void {
    if (this.isCapturing) {
      this.emit('audioData', audioData)
    }
  }

  /**
   * Check if currently capturing.
   */
  getIsCapturing(): boolean {
    return this.isCapturing
  }

  /**
   * Get selected device ID.
   */
  getSelectedDeviceId(): string | null {
    return this.selectedDeviceId
  }
}
