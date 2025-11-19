"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { VoiceMode, VoiceState, VoiceSettings } from '@/types/voice'

export function useVoice(
  onTranscript: (text: string, isFinal: boolean) => void,
  settings: VoiceSettings
) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState('')

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecognitionActiveRef = useRef<boolean>(false) // Track if recognition is currently active
  const isPendingRestartRef = useRef<boolean>(false) // Prevent multiple simultaneous restarts
  const wakeWordDetectedRef = useRef<boolean>(false) // Prevent multiple wake word detections

  // Initialisation des APIs Web Speech
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("La reconnaissance vocale n'est pas supportée par votre navigateur. Utilisez Chrome, Edge ou Safari.")
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = settings.language || 'fr-FR'
    recognitionRef.current.maxAlternatives = 1

    synthesisRef.current = window.speechSynthesis

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Recognition already stopped')
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current)
      }
      isRecognitionActiveRef.current = false
      isPendingRestartRef.current = false
    }
  }, [settings.language])

  // Son d'activation (bip)
  const playActivationSound = useCallback(() => {
    try {
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 880 // Note La (A5)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.15)
    } catch (e) {
      console.log('Could not play activation sound:', e)
    }
  }, [])

  // Démarrer le mode automatique (écoute du wake word)
  const startWakeWordListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[Voice] Starting wake word listening...')
    setVoiceState('listening-wake-word')
    setIsListening(true)
    setError(null)
    wakeWordDetectedRef.current = false // Reset flag

    let wakeWordBuffer = ''

    recognitionRef.current.onresult = (event: any) => {
      // Si déjà détecté, ignorer les résultats suivants
      if (wakeWordDetectedRef.current) return

      // Récupérer tous les résultats
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' '
      }

      transcript = transcript.toLowerCase().trim()
      wakeWordBuffer = (wakeWordBuffer + ' ' + transcript).slice(-100) // Garder les 100 derniers caractères

      console.log('[Voice] Wake word buffer:', wakeWordBuffer)

      // Détection du wake word (plusieurs variantes)
      const wakeWords = [
        'hey agent',
        'hé agent',
        'agent',
        'ok agent',
        'hey genius',
        'hé genius'
      ]

      const detected = wakeWords.some(word =>
        wakeWordBuffer.includes(word) ||
        transcript.includes(word)
      )

      if (detected && !wakeWordDetectedRef.current) {
        console.log('[Voice] Wake word detected!')
        wakeWordDetectedRef.current = true // Marquer comme détecté
        wakeWordBuffer = '' // Reset le buffer

        // Arrêter immédiatement la reconnaissance
        try {
          recognitionRef.current?.stop()
          isRecognitionActiveRef.current = false
        } catch (e) {
          console.log('Could not stop recognition after wake word')
        }

        onWakeWordDetected()
      }
    }

    recognitionRef.current.onstart = () => {
      isRecognitionActiveRef.current = true
      isPendingRestartRef.current = false
      console.log('[Voice] Recognition started')
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error)
      isRecognitionActiveRef.current = false

      // Ne pas traiter comme erreur fatale
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Redémarrer automatiquement
        if (settings.mode === 'automatic' && !isPendingRestartRef.current) {
          isPendingRestartRef.current = true
          restartTimerRef.current = setTimeout(() => {
            if (settings.mode === 'automatic' && !isRecognitionActiveRef.current) {
              try {
                recognitionRef.current?.start()
              } catch (e) {
                console.log('[Voice] Could not restart after error')
                isPendingRestartRef.current = false
              }
            }
          }, 500)
        }
      } else if (event.error === 'not-allowed') {
        setError("Accès au microphone refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.")
        setVoiceState('idle')
        setIsListening(false)
      }
    }

    recognitionRef.current.onend = () => {
      console.log('[Voice] Recognition ended')
      isRecognitionActiveRef.current = false

      // Redémarrer automatiquement en mode wake word
      if (settings.mode === 'automatic' && voiceState === 'listening-wake-word' && !isPendingRestartRef.current) {
        isPendingRestartRef.current = true
        restartTimerRef.current = setTimeout(() => {
          if (settings.mode === 'automatic' && !isRecognitionActiveRef.current) {
            try {
              recognitionRef.current?.start()
            } catch (e) {
              console.log('[Voice] Could not restart after end')
              isPendingRestartRef.current = false
            }
          }
        }, 500)
      }
    }

    // Start recognition only if not already active
    if (!isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('[Voice] Failed to start recognition:', e)
        setError("Impossible de démarrer la reconnaissance vocale")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode])

  // Wake word détecté
  const onWakeWordDetected = useCallback(() => {
    console.log('[Voice] Activating conversation mode...')

    // Arrêter la reconnaissance actuelle
    try {
      recognitionRef.current?.stop()
      isRecognitionActiveRef.current = false
    } catch (e) {
      console.log('Could not stop recognition')
    }

    setVoiceState('speaking')
    playActivationSound()

    // Réponse vocale
    speak("Oui, je vous écoute !", () => {
      // Attendre 500ms après la fin de la synthèse pour éviter de capter l'écho
      setTimeout(() => {
        startConversationListening()
      }, 500)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playActivationSound])

  // Écoute de la conversation
  const startConversationListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[Voice] Starting conversation listening...')
    setVoiceState('active')

    let finalTranscript = ''
    let lastResultIndex = 0 // Track processed results

    recognitionRef.current.onresult = (event: any) => {
      let interim = ''

      // Process only NEW final results
      for (let i = lastResultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
          lastResultIndex = i + 1
        } else {
          interim += transcript
        }
      }

      // Afficher le transcript intermédiaire
      setInterimTranscript(interim)

      // Notifier le transcript intermédiaire
      if (interim) {
        onTranscript(interim, false)
      }

      // Détecter une pause dans la parole
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      if (finalTranscript.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          const textToSend = finalTranscript.trim()
          console.log('[Voice] Silence detected, sending final transcript:', textToSend)
          onTranscript(textToSend, true)
          setInterimTranscript('')
          finalTranscript = ''
          lastResultIndex = 0
        }, 1500) // 1.5 secondes de silence
      }
    }

    recognitionRef.current.onstart = () => {
      isRecognitionActiveRef.current = true
      console.log('[Voice] Conversation recognition started')
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('[Voice] Conversation error:', event.error)
      isRecognitionActiveRef.current = false
      if (event.error === 'not-allowed') {
        setError("Accès au microphone refusé")
        stopListening()
      }
    }

    recognitionRef.current.onend = () => {
      console.log('[Voice] Conversation ended')
      isRecognitionActiveRef.current = false
      // Ne pas redémarrer automatiquement en mode conversation
      // L'utilisateur doit réactiver avec le wake word
    }

    // Start recognition only if not already active
    if (!isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('[Voice] Failed to start conversation:', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript])

  // Mode manuel (push to talk)
  const startManualListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[Voice] Starting manual listening...')
    setVoiceState('active')
    setIsListening(true)
    setError(null)

    let finalTranscript = ''

    recognitionRef.current.onresult = (event: any) => {
      let interim = ''
      finalTranscript = ''

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interim += transcript
        }
      }

      setInterimTranscript(interim)

      if (interim) {
        onTranscript(interim, false)
      }
    }

    recognitionRef.current.onstart = () => {
      isRecognitionActiveRef.current = true
      console.log('[Voice] Manual recognition started')
    }

    recognitionRef.current.onend = () => {
      isRecognitionActiveRef.current = false
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim(), true)
      }
      setInterimTranscript('')
      setVoiceState('idle')
      setIsListening(false)
    }

    recognitionRef.current.onerror = (event: any) => {
      console.error('[Voice] Manual mode error:', event.error)
      isRecognitionActiveRef.current = false
      if (event.error === 'not-allowed') {
        setError("Accès au microphone refusé")
      }
      setVoiceState('idle')
      setIsListening(false)
    }

    // Start recognition only if not already active
    if (!isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('[Voice] Failed to start manual listening:', e)
      }
    }
  }, [onTranscript])

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    console.log('[Voice] Stopping listening...')

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        isRecognitionActiveRef.current = false // Mark as inactive
      } catch (e) {
        console.log('Recognition already stopped')
      }
    }

    // Clear all timers and flags
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    isPendingRestartRef.current = false

    setIsListening(false)
    setVoiceState('idle')
    setInterimTranscript('')
  }, [])

  // Retourner en mode wake word
  const returnToWakeWordMode = useCallback(() => {
    console.log('[Voice] Returning to wake word mode...')

    if (settings.mode === 'automatic') {
      speak("À bientôt !", () => {
        setTimeout(() => {
          startWakeWordListening()
        }, 500)
      })
    } else {
      stopListening()
    }
  }, [settings.mode, startWakeWordListening, stopListening])

  // Synthèse vocale
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthesisRef.current || !settings.autoSpeak) {
      onEnd?.()
      return
    }

    console.log('[Voice] Speaking:', text)

    // Arrêter toute parole en cours
    synthesisRef.current.cancel()

    setVoiceState('speaking')

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = settings.language || 'fr-FR'
    utterance.rate = settings.voiceSpeed || 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      console.log('[Voice] Speaking ended')
      setVoiceState('active')
      onEnd?.()
    }

    utterance.onerror = (e) => {
      console.error('[Voice] Speech synthesis error:', e)
      setVoiceState('active')
      onEnd?.()
    }

    synthesisRef.current.speak(utterance)
  }, [settings.autoSpeak, settings.language, settings.voiceSpeed])

  // Effets selon le mode
  useEffect(() => {
    console.log('[Voice] Mode changed to:', settings.mode)

    if (settings.mode === 'automatic') {
      startWakeWordListening()
    } else {
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [settings.mode])

  return {
    voiceState,
    isListening,
    error,
    interimTranscript,
    startManualListening,
    stopListening,
    speak,
    returnToWakeWordMode,
    startConversationListening,
    startWakeWordListening, // Exposer pour le mode automatique
  }
}
