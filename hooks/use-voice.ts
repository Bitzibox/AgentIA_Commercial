"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { VoiceMode, VoiceState, VoiceSettings } from '@/types/voice'
import { cleanTextForSpeech } from '@/lib/text-cleaner'

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
  const interruptionRecognitionRef = useRef<any>(null) // Pour l'écoute d'interruption
  const isListeningForInterruptionRef = useRef<boolean>(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null) // Timer pour retourner au wake word après inactivité
  const isInConversationModeRef = useRef<boolean>(false) // Indique si on est en mode conversation (après wake word)
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

    // Initialiser l'instance de reconnaissance pour les interruptions
    interruptionRecognitionRef.current = new SpeechRecognition()
    interruptionRecognitionRef.current.continuous = true
    interruptionRecognitionRef.current.interimResults = true
    interruptionRecognitionRef.current.lang = settings.language || 'fr-FR'

    interruptionRecognitionRef.current.onresult = (event: any) => {
      // Chercher le dernier résultat final
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.trim()

          // Ignorer les transcripts vides ou très courts
          if (transcript.length < 2) continue

          console.log('[Voice] Interruption détectée:', transcript)

          // Réinitialiser le timer d'inactivité
          resetInactivityTimer()

          // Arrêter l'écoute d'interruption
          stopListeningForInterruption()

          // Arrêter la synthèse vocale
          if (synthesisRef.current) {
            synthesisRef.current.cancel()
          }

          // Traiter la parole de l'utilisateur
          onTranscript(transcript, true)
          setInterimTranscript('')
          break
        }
      }
    }

    interruptionRecognitionRef.current.onend = () => {
      isListeningForInterruptionRef.current = false
      console.log('[Voice] Écoute d\'interruption terminée')
    }

    interruptionRecognitionRef.current.onerror = (event: any) => {
      console.error('[Voice] Erreur écoute interruption:', event.error)
      // Ne pas traiter comme une erreur fatale
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        isListeningForInterruptionRef.current = false
      }
    }

    synthesisRef.current = window.speechSynthesis

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('Recognition already stopped')
        }
      }
      if (interruptionRecognitionRef.current) {
        try {
          interruptionRecognitionRef.current.stop()
        } catch (e) {
          console.log('Interruption recognition already stopped')
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
      isListeningForInterruptionRef.current = false
    }
  }, [settings.language, onTranscript])

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

    // Activer le mode conversation
    isInConversationModeRef.current = true

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
        // Démarrer le timer d'inactivité (appelé directement, pas via le callback)
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current)
        }
        console.log('[Voice] Démarrage timer d\'inactivité (30s)')
        inactivityTimerRef.current = setTimeout(() => {
          console.log('[Voice] Timeout d\'inactivité atteint, retour au wake word')
          isInConversationModeRef.current = false
          if (synthesisRef.current && settings.autoSpeak) {
            speak("Je me mets en veille. Dites Hey Agent pour me réveiller.", () => {
              setTimeout(() => {
                startWakeWordListening()
              }, 500)
            })
          } else {
            startWakeWordListening()
          }
        }, 30000)
      }, 500)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playActivationSound, settings.autoSpeak])

  // Écoute de la conversation
  const startConversationListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[Voice] Starting conversation listening...')
    setVoiceState('active')

    let finalTranscript = ''
    let lastResultIndex = 0 // Track processed results

    recognitionRef.current.onresult = (event: any) => {
      let interim = ''

      // Réinitialiser le timer d'inactivité dès qu'il y a une activité
      if (isInConversationModeRef.current && inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        console.log('[Voice] Réinitialisation timer d\'inactivité (via onresult)')
        inactivityTimerRef.current = setTimeout(() => {
          console.log('[Voice] Timeout d\'inactivité atteint, retour au wake word')
          isInConversationModeRef.current = false
          if (synthesisRef.current && settings.autoSpeak) {
            const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech("Je me mets en veille. Dites Hey Agent pour me réveiller."))
            utterance.lang = settings.language || 'fr-FR'
            utterance.rate = settings.voiceSpeed || 1.0
            utterance.pitch = 1.0
            utterance.volume = 1.0
            utterance.onend = () => {
              setTimeout(() => {
                startWakeWordListening()
              }, 500)
            }
            synthesisRef.current.speak(utterance)
          } else {
            startWakeWordListening()
          }
        }, 30000)
      }

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

      // Si on est en mode conversation, continuer d'écouter
      if (isInConversationModeRef.current) {
        console.log('[Voice] Mode conversation actif, redémarrage de l\'écoute...')
        setTimeout(() => {
          if (isInConversationModeRef.current && !isRecognitionActiveRef.current) {
            try {
              recognitionRef.current?.start()
            } catch (e) {
              console.error('[Voice] Failed to restart conversation:', e)
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
        console.error('[Voice] Failed to start conversation:', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTranscript, settings.autoSpeak, settings.language, settings.voiceSpeed])

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

    // Désactiver le mode conversation
    isInConversationModeRef.current = false

    // Arrêter le timer d'inactivité (logique inline pour éviter dépendance circulaire)
    if (inactivityTimerRef.current) {
      console.log('[Voice] Arrêt timer d\'inactivité')
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }

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

  // Démarrer l'écoute pour détecter les interruptions
  const startListeningForInterruption = useCallback(() => {
    if (!interruptionRecognitionRef.current || isListeningForInterruptionRef.current) {
      return
    }

    console.log('[Voice] Démarrage écoute d\'interruption...')
    isListeningForInterruptionRef.current = true

    try {
      interruptionRecognitionRef.current.start()
    } catch (error) {
      console.error('[Voice] Erreur démarrage écoute interruption:', error)
      isListeningForInterruptionRef.current = false
    }
  }, [])

  // Arrêter l'écoute d'interruption
  const stopListeningForInterruption = useCallback(() => {
    if (!interruptionRecognitionRef.current || !isListeningForInterruptionRef.current) {
      return
    }

    console.log('[Voice] Arrêt écoute d\'interruption...')

    try {
      interruptionRecognitionRef.current.stop()
    } catch (error) {
      console.error('[Voice] Erreur arrêt écoute interruption:', error)
    }

    isListeningForInterruptionRef.current = false
  }, [])

  // Démarrer le timer d'inactivité (retour au wake word après 30s sans activité)
  const startInactivityTimer = useCallback(() => {
    // Annuler le timer existant s'il y en a un
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }

    console.log('[Voice] Démarrage timer d\'inactivité (30s)')

    inactivityTimerRef.current = setTimeout(() => {
      console.log('[Voice] Timeout d\'inactivité atteint, retour au wake word')
      isInConversationModeRef.current = false

      // Annoncer qu'on retourne en mode veille
      if (synthesisRef.current && settings.autoSpeak) {
        const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech("Je me mets en veille. Dites Hey Agent pour me réveiller."))
        utterance.lang = settings.language || 'fr-FR'
        utterance.rate = settings.voiceSpeed || 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.onend = () => {
          setTimeout(() => {
            startWakeWordListening()
          }, 500)
        }
        synthesisRef.current.speak(utterance)
      } else {
        startWakeWordListening()
      }
    }, 30000) // 30 secondes
  }, [settings.autoSpeak, settings.language, settings.voiceSpeed])

  // Réinitialiser le timer d'inactivité (appelé à chaque activité de l'utilisateur)
  const resetInactivityTimer = useCallback(() => {
    if (isInConversationModeRef.current) {
      console.log('[Voice] Réinitialisation timer d\'inactivité')
      // Annuler le timer existant
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      // Redémarrer le timer
      startInactivityTimer()
    }
  }, [startInactivityTimer])

  // Arrêter le timer d'inactivité
  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      console.log('[Voice] Arrêt timer d\'inactivité')
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
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

    // Arrêter toute parole en cours et l'écoute d'interruption éventuelle
    synthesisRef.current.cancel()
    stopListeningForInterruption()

    setVoiceState('speaking')

    // Nettoyer le texte pour la synthèse vocale
    const cleanedText = cleanTextForSpeech(text)

    const utterance = new SpeechSynthesisUtterance(cleanedText)
    utterance.lang = settings.language || 'fr-FR'
    utterance.rate = settings.voiceSpeed || 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      console.log('[Voice] Speaking started')
      // Démarrer l'écoute d'interruption après 1 seconde
      // pour éviter de capter le début de la synthèse vocale
      setTimeout(() => {
        if (synthesisRef.current && synthesisRef.current.speaking) {
          startListeningForInterruption()
        }
      }, 1000)
    }

    utterance.onend = () => {
      console.log('[Voice] Speaking ended')
      // Arrêter l'écoute d'interruption
      stopListeningForInterruption()
      setVoiceState('active')

      // Si on est en mode conversation, continuer d'écouter
      if (isInConversationModeRef.current) {
        console.log('[Voice] Reprise de l\'écoute de conversation après réponse')
        setTimeout(() => {
          if (isInConversationModeRef.current) {
            startConversationListening()
            resetInactivityTimer()
          }
        }, 500)
      }

      onEnd?.()
    }

    utterance.onerror = (e) => {
      console.log('[Voice] Speech synthesis error:', e)
      // Arrêter l'écoute d'interruption en cas d'erreur
      stopListeningForInterruption()
      setVoiceState('active')

      // Si on est en mode conversation, continuer d'écouter malgré l'erreur
      if (isInConversationModeRef.current) {
        console.log('[Voice] Reprise de l\'écoute malgré l\'erreur')
        setTimeout(() => {
          if (isInConversationModeRef.current) {
            startConversationListening()
            resetInactivityTimer()
          }
        }, 500)
      }

      onEnd?.()
    }

    synthesisRef.current.speak(utterance)
  }, [settings.autoSpeak, settings.language, settings.voiceSpeed, startListeningForInterruption, stopListeningForInterruption, startConversationListening, resetInactivityTimer])

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
