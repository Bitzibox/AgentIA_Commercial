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

  // ÉTAT SIMPLIFIÉ selon l'approche Gemini
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Mode vocal actuel : 'disabled' | 'wake-word' | 'conversation'
  const voiceModeRef = useRef<'disabled' | 'wake-word' | 'conversation'>('disabled')

  // État réel de la reconnaissance (true si recognition.start() a été appelé et onstart reçu)
  const isListeningRef = useRef<boolean>(false)

  // État de la synthèse vocale (pour gérer l'interruption)
  const isSpeakingRef = useRef<boolean>(false)

  // Timers
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Données de transcription
  const currentTranscriptRef = useRef<string>('') // Transcript accumulé
  const lastResultIndexRef = useRef<number>(0) // Index du dernier résultat traité

  // Refs pour les handlers (pour éviter stale closures)
  const handleWakeWordResultsRef = useRef<((event: any) => void) | null>(null)
  const handleConversationResultsRef = useRef<((event: any) => void) | null>(null)

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

    // ============================================
    // HANDLERS SELON L'APPROCHE GEMINI
    // ============================================

    // onstart : Met à jour l'état réel
    recognitionRef.current.onstart = () => {
      isListeningRef.current = true
      console.log(`[Voice] Recognition started (mode: ${voiceModeRef.current})`)
    }

    // onerror : Log seulement, ne redémarre PAS
    recognitionRef.current.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error)

      // Si permission refusée, désactiver le mode
      if (event.error === 'not-allowed') {
        voiceModeRef.current = 'disabled'
        setError("Accès au microphone refusé")
      }

      // NE PAS redémarrer ici - onend s'en occupera
    }

    // onend : Redémarrage automatique si mode !== 'disabled'
    recognitionRef.current.onend = () => {
      isListeningRef.current = false
      console.log(`[Voice] Recognition ended (mode: ${voiceModeRef.current})`)

      // Auto-redémarrage basé sur le mode actuel
      if (voiceModeRef.current !== 'disabled') {
        console.log(`[Voice] Auto-restarting in ${voiceModeRef.current} mode...`)
        setTimeout(() => {
          // Double vérification que le mode n'a pas changé pendant le setTimeout
          if (voiceModeRef.current !== 'disabled' && !isListeningRef.current) {
            try {
              recognitionRef.current?.start()
            } catch (e) {
              console.error('[Voice] Failed to auto-restart:', e)
            }
          }
        }, 100) // Petit délai pour éviter les boucles infinies
      }
    }

    // onresult : Traitement adapté selon le mode
    recognitionRef.current.onresult = (event: any) => {
      if (voiceModeRef.current === 'wake-word') {
        // Mode wake-word : détection du mot-clé "elsi"
        handleWakeWordResultsRef.current?.(event)
      } else if (voiceModeRef.current === 'conversation') {
        // Mode conversation : accumulation du transcript
        handleConversationResultsRef.current?.(event)
      }
    }

    synthesisRef.current = window.speechSynthesis

    return () => {
      voiceModeRef.current = 'disabled'
      if (recognitionRef.current && isListeningRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.log('[Voice] Recognition already stopped')
        }
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
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

  // ============================================
  // FONCTIONS CENTRALISÉES (approche Gemini)
  // ============================================

  // Démarrer l'écoute (wake-word OU conversation)
  const startListening = useCallback((mode: 'wake-word' | 'conversation') => {
    if (!recognitionRef.current) {
      console.error('[Voice] Recognition not initialized')
      return
    }

    // Vérifier si on écoute déjà
    if (isListeningRef.current) {
      console.log(`[Voice] Already listening, skipping start (current mode: ${voiceModeRef.current})`)
      return
    }

    console.log(`[Voice] Starting listening in ${mode} mode...`)
    voiceModeRef.current = mode

    setVoiceState(mode === 'wake-word' ? 'listening-wake-word' : 'active')
    setIsListening(true)

    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('[Voice] Failed to start recognition:', e)
      setError("Impossible de démarrer la reconnaissance vocale")
    }
  }, [])

  // Arrêter l'écoute
  const stopListening = useCallback(() => {
    console.log('[Voice] Stopping listening...')
    voiceModeRef.current = 'disabled'

    // Annuler tous les timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }

    // Arrêter la reconnaissance si active
    if (isListeningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.log('[Voice] Recognition already stopped')
      }
    }

    setIsListening(false)
    setVoiceState('idle')
    setInterimTranscript('')
    currentTranscriptRef.current = ''
    lastResultIndexRef.current = 0
  }, [])

  // Synthèse vocale (TTS) avec support d'interruption
  const speak = useCallback((text: string, onEnd?: () => void, isShortMessage: boolean = false) => {
    if (!synthesisRef.current || !settings.autoSpeak) {
      onEnd?.()
      return
    }

    console.log('[Voice] Speaking:', text, `(short: ${isShortMessage})`)

    // Arrêter toute parole en cours
    synthesisRef.current.cancel()

    // Marquer qu'on commence à parler
    isSpeakingRef.current = true

    // Sauvegarder le mode précédent AVANT de le changer
    const previousMode = voiceModeRef.current
    const wasInConversation = previousMode === 'conversation'

    // Annuler le timer d'inactivité pendant qu'on parle
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
      console.log('[Voice] Timer d\'inactivité annulé pendant la synthèse')
    }

    // Arrêter l'écoute temporairement pour éviter que l'assistant s'auto-écoute
    if (isListeningRef.current) {
      voiceModeRef.current = 'disabled'
      recognitionRef.current?.stop()
    }

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

      // Pour les messages longs, démarrer l'écoute d'interruption APRÈS un délai de sécurité
      if (!isShortMessage) {
        setTimeout(() => {
          // Double-check qu'on parle encore (pas déjà interrompu)
          if (isSpeakingRef.current) {
            console.log('[Voice] Starting interruption listening (wake-word mode)...')
            startListening('wake-word')
          }
        }, 800) // Délai de 800ms pour éviter l'auto-capture de la voix de l'IA
      }
    }

    utterance.onend = () => {
      console.log('[Voice] Speaking ended')
      isSpeakingRef.current = false
      setVoiceState('active')

      // Si message long ET écoute d'interruption active, l'arrêter
      if (!isShortMessage && isListeningRef.current) {
        console.log('[Voice] Stopping interruption listening...')
        voiceModeRef.current = 'disabled'
        recognitionRef.current?.stop()
      }

      // Si on était en conversation, reprendre l'écoute de conversation
      if (wasInConversation) {
        console.log('[Voice] Reprise écoute conversation après synthèse')
        setTimeout(() => {
          startListening('conversation')

          // Recréer le timer d'inactivité (30s)
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
          }
          inactivityTimerRef.current = setTimeout(() => {
            console.log('[Voice] Timeout d\'inactivité, retour au wake word')
            voiceModeRef.current = 'disabled'
            speak("Je me mets en veille. Dites Elsi pour me réveiller.", () => {
              setTimeout(() => startListening('wake-word'), 500)
            }, true) // ← Message court, pas d'interruption
          }, 30000)
        }, 500)
      }

      onEnd?.()
    }

    utterance.onerror = (e) => {
      console.log('[Voice] Speech synthesis error:', e)
      isSpeakingRef.current = false
      setVoiceState('active')

      // Arrêter l'écoute d'interruption si active
      if (!isShortMessage && isListeningRef.current) {
        voiceModeRef.current = 'disabled'
        recognitionRef.current?.stop()
      }

      // Reprendre l'écoute même en cas d'erreur
      if (wasInConversation) {
        setTimeout(() => {
          startListening('conversation')

          // Recréer le timer d'inactivité
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
          }
          inactivityTimerRef.current = setTimeout(() => {
            console.log('[Voice] Timeout d\'inactivité, retour au wake word')
            voiceModeRef.current = 'disabled'
            speak("Je me mets en veille. Dites Elsi pour me réveiller.", () => {
              setTimeout(() => startListening('wake-word'), 500)
            }, true)
          }, 30000)
        }, 500)
      }

      onEnd?.()
    }

    synthesisRef.current.speak(utterance)
  }, [settings.autoSpeak, settings.language, settings.voiceSpeed, startListening])

  // ============================================
  // HANDLERS DE RÉSULTATS
  // ============================================

  // Traitement des résultats en mode wake-word
  const handleWakeWordResults = useCallback((event: any) => {
    let transcript = ''
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript
    }

    const lowerTranscript = transcript.toLowerCase()
    console.log('[Voice] Wake word buffer:', lowerTranscript)

    // Détecter "elsi" et ses variantes (elsie, elsy, elsif, etc.)
    const wakeWordVariants = ['elsi', 'elsie', 'elsy', 'elsif', 'elzi', 'helsi']
    const wakeWordDetected = wakeWordVariants.some(variant => lowerTranscript.includes(variant))

    if (wakeWordDetected) {
      // Vérifier si c'est une interruption (l'IA était en train de parler)
      const isInterruption = isSpeakingRef.current

      if (isInterruption) {
        console.log('[Voice] 🎯 INTERRUPTION DÉTECTÉE ! L\'utilisateur a dit "Elsi" pendant que l\'IA parlait')
        // Annuler immédiatement la synthèse en cours
        if (synthesisRef.current) {
          synthesisRef.current.cancel()
          isSpeakingRef.current = false
        }
      } else {
        console.log('[Voice] Wake word detected!')
      }

      // Arrêter toute écoute en cours
      voiceModeRef.current = 'disabled'
      if (isListeningRef.current) {
        recognitionRef.current?.stop()
      }

      // Activer le son
      playActivationSound()

      // Répondre et activer le mode conversation
      // IMPORTANT: isShortMessage = true pour éviter de lancer l'écoute d'interruption
      speak("Oui, je vous écoute !", () => {
        setTimeout(() => {
          startListening('conversation')

          // Démarrer le timer d'inactivité (30s)
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
          }
          inactivityTimerRef.current = setTimeout(() => {
            console.log('[Voice] Timeout d\'inactivité, retour au wake word')
            voiceModeRef.current = 'disabled'
            speak("Je me mets en veille. Dites Elsi pour me réveiller.", () => {
              setTimeout(() => startListening('wake-word'), 500)
            }, true) // ← Message court
          }, 30000)
        }, 500)
      }, true) // ← IMPORTANT: isShortMessage = true
    }
  }, [playActivationSound, speak, startListening])

  // Mettre à jour le ref quand le handler change
  useEffect(() => {
    handleWakeWordResultsRef.current = handleWakeWordResults
  }, [handleWakeWordResults])

  // Traitement des résultats en mode conversation
  const handleConversationResults = useCallback((event: any) => {
    let interim = ''
    let hasFinalResult = false

    // Réinitialiser le timer d'inactivité à chaque activité
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = setTimeout(() => {
        console.log('[Voice] Timeout d\'inactivité, retour au wake word')
        voiceModeRef.current = 'disabled'
        speak("Je me mets en veille. Dites Elsi pour me réveiller.", () => {
          setTimeout(() => startListening('wake-word'), 500)
        }, true) // ← Message court
      }, 30000)
    }

    // Traiter les résultats
    for (let i = lastResultIndexRef.current; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript

      if (event.results[i].isFinal) {
        currentTranscriptRef.current += transcript + ' '
        lastResultIndexRef.current = i + 1
        hasFinalResult = true
        console.log('[Voice] Accumulated transcript:', currentTranscriptRef.current)
      } else {
        interim += transcript
      }
    }

    // Afficher le transcript intermédiaire
    setInterimTranscript(interim)
    if (interim) {
      onTranscript(interim, false)
    }

    // Timer de silence : seulement si résultat final
    if (hasFinalResult && currentTranscriptRef.current.trim()) {
      // Annuler le timer de silence existant
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }

      // Annuler le timer d'inactivité (le timer de silence prend le relais)
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }

      // Créer le timer de silence (2s)
      console.log('[Voice] Timer de silence 2s démarré')
      silenceTimerRef.current = setTimeout(() => {
        const textToSend = currentTranscriptRef.current.trim()
        console.log('[Voice] Silence détecté, envoi:', textToSend)

        onTranscript(textToSend, true)
        setInterimTranscript('')
        currentTranscriptRef.current = ''
        lastResultIndexRef.current = 0

        // Recréer le timer d'inactivité après envoi
        if (voiceModeRef.current === 'conversation') {
          inactivityTimerRef.current = setTimeout(() => {
            console.log('[Voice] Timeout d\'inactivité, retour au wake word')
            voiceModeRef.current = 'disabled'
            speak("Je me mets en veille. Dites Elsi pour me réveiller.", () => {
              setTimeout(() => startListening('wake-word'), 500)
            }, true) // ← Message court
          }, 30000)
        }
      }, 2000)
    }
  }, [onTranscript, speak, startListening])

  // Mettre à jour le ref quand le handler change
  useEffect(() => {
    handleConversationResultsRef.current = handleConversationResults
  }, [handleConversationResults])

  // Mode manuel (push to talk) - garde l'ancienne logique
  const startManualListening = useCallback(() => {
    if (!recognitionRef.current) return

    console.log('[Voice] Starting manual listening...')

    // Pour le mode manuel, on utilise l'ancienne méthode (pas de mode continuous)
    voiceModeRef.current = 'disabled' // Pas de redémarrage automatique
    setVoiceState('active')
    setIsListening(true)
    setError(null)

    let finalTranscript = ''

    // Overwrite handlers pour le mode manuel
    const manualOnResult = (event: any) => {
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

    const manualOnEnd = () => {
      isListeningRef.current = false
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim(), true)
      }
      setInterimTranscript('')
      setVoiceState('idle')
      setIsListening(false)

      // Restaurer les handlers normaux
      setupNormalHandlers()
    }

    const manualOnError = (event: any) => {
      console.error('[Voice] Manual mode error:', event.error)
      isListeningRef.current = false
      if (event.error === 'not-allowed') {
        setError("Accès au microphone refusé")
      }
      setVoiceState('idle')
      setIsListening(false)

      // Restaurer les handlers normaux
      setupNormalHandlers()
    }

    const setupNormalHandlers = () => {
      if (!recognitionRef.current) return

      recognitionRef.current.onresult = (event: any) => {
        if (voiceModeRef.current === 'wake-word') {
          handleWakeWordResultsRef.current?.(event)
        } else if (voiceModeRef.current === 'conversation') {
          handleConversationResultsRef.current?.(event)
        }
      }

      recognitionRef.current.onend = () => {
        isListeningRef.current = false
        console.log(`[Voice] Recognition ended (mode: ${voiceModeRef.current})`)
        if (voiceModeRef.current !== 'disabled') {
          console.log(`[Voice] Auto-restarting in ${voiceModeRef.current} mode...`)
          setTimeout(() => {
            if (voiceModeRef.current !== 'disabled' && !isListeningRef.current) {
              try {
                recognitionRef.current?.start()
              } catch (e) {
                console.error('[Voice] Failed to auto-restart:', e)
              }
            }
          }, 100)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('[Voice] Recognition error:', event.error)
        if (event.error === 'not-allowed') {
          voiceModeRef.current = 'disabled'
          setError("Accès au microphone refusé")
        }
      }
    }

    // Appliquer les handlers manuels
    recognitionRef.current.onresult = manualOnResult
    recognitionRef.current.onend = manualOnEnd
    recognitionRef.current.onerror = manualOnError

    // Démarrer
    if (!isListeningRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('[Voice] Failed to start manual listening:', e)
      }
    }
  }, [onTranscript])

  // Effets selon le mode
  useEffect(() => {
    console.log('[Voice] Mode changed to:', settings.mode)

    if (settings.mode === 'automatic') {
      startListening('wake-word')
    } else {
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [settings.mode, startListening, stopListening])

  return {
    voiceState,
    isListening,
    error,
    interimTranscript,
    startManualListening,
    stopListening,
    speak,
  }
}
