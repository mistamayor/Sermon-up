import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'

interface AudioCaptureOptions {
  onAudioData?: (data: Float32Array) => void
}

export function useAudioCapture(options: AudioCaptureOptions = {}) {
  const { onAudioData } = options
  const {
    selectedDeviceId,
    setAudioLevels,
    setSystemStatus,
    audioDevices,
    setAudioDevices,
  } = useAppStore()

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  // Get available audio devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 4)}`,
          kind: d.kind as 'audioinput',
        }))
      setAudioDevices(audioInputs)
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }, [setAudioDevices])

  // Start audio capture
  const startCapture = useCallback(async () => {
    if (!selectedDeviceId) return

    try {
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 16000,
        },
      })

      streamRef.current = stream

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      // Create analyser for levels
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      // Connect stream to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      // Start level monitoring
      const dataArray = new Float32Array(analyser.frequencyBinCount)

      const updateLevels = () => {
        if (!analyserRef.current) return

        analyserRef.current.getFloatTimeDomainData(dataArray)

        // Calculate RMS
        let sum = 0
        let peak = 0
        for (let i = 0; i < dataArray.length; i++) {
          const sample = dataArray[i]
          sum += sample * sample
          if (Math.abs(sample) > peak) {
            peak = Math.abs(sample)
          }
        }
        const rms = Math.sqrt(sum / dataArray.length)

        setAudioLevels({ rms, peak })

        // Send audio data if callback provided
        if (onAudioData) {
          onAudioData(dataArray)
        }

        animationFrameRef.current = requestAnimationFrame(updateLevels)
      }

      updateLevels()
      setSystemStatus({ isListening: true })
    } catch (error) {
      console.error('Failed to start audio capture:', error)
      setSystemStatus({ isListening: false })
    }
  }, [selectedDeviceId, setAudioLevels, setSystemStatus, onAudioData])

  // Stop audio capture
  const stopCapture = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    setAudioLevels({ rms: 0, peak: 0 })
    setSystemStatus({ isListening: false })
  }, [setAudioLevels, setSystemStatus])

  // Initialize devices on mount
  useEffect(() => {
    refreshDevices()

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', refreshDevices)
      stopCapture()
    }
  }, [refreshDevices, stopCapture])

  return {
    audioDevices,
    startCapture,
    stopCapture,
    refreshDevices,
  }
}
