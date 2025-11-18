// Orchestrateur de conversation vocale
import { voiceRecognitionService } from "./voice-recognition"
import { textToSpeechService } from "./text-to-speech"
import { voiceCommandsParser, VoiceCommand } from "./voice-commands-parser"

export type ConversationState =
  | "idle" // En attente
  | "listening" // En écoute (utilisateur parle)
  | "processing" // Traitement IA en cours
  | "speaking" // Assistant parle

export interface ConversationCallbacks {
  onStateChange?: (state: ConversationState) => void
  onUserMessage?: (message: string) => void
  onAssistantResponse?: (response: string) => Promise<void>
  onCommand?: (command: VoiceCommand) => void
  onError?: (error: string) => void
}

export class VoiceConversationOrchestrator {
  private isActive = false
  private currentState: ConversationState = "idle"
  private lastAssistantMessage = ""
  private callbacks: ConversationCallbacks = {}
  private autoRestartListening = true // Redémarrer automatiquement l'écoute après la réponse

  constructor() {
    this.setupServices()
  }

  // Configuration des services
  private setupServices() {
    // Reconnaissance vocale - Résultat obtenu
    voiceRecognitionService.onResult((transcript) => {
      this.handleUserSpeech(transcript)
    })

    // Reconnaissance vocale - Erreur
    voiceRecognitionService.onError((error) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      // Redémarrer l'écoute en cas d'erreur si le mode est actif
      if (this.isActive && this.currentState === "listening") {
        setTimeout(() => {
          if (this.isActive) {
            this.startListening()
          }
        }, 1000)
      }
    })

    // Reconnaissance vocale - Changement d'état
    voiceRecognitionService.onStateChange((isListening) => {
      if (isListening) {
        this.setState("listening")
      } else if (this.currentState === "listening") {
        // Passage en mode processing quand l'écoute se termine
        this.setState("processing")
      }
    })

    // Synthèse vocale - Début de parole
    textToSpeechService.onStart(() => {
      this.setState("speaking")
    })

    // Synthèse vocale - Fin de parole
    textToSpeechService.onEnd(() => {
      if (this.isActive && this.autoRestartListening) {
        // Redémarrer l'écoute après que l'assistant ait fini de parler
        setTimeout(() => {
          if (this.isActive) {
            this.startListening()
          }
        }, 500)
      } else {
        this.setState("idle")
      }
    })

    // Synthèse vocale - Erreur
    textToSpeechService.onError((error) => {
      if (this.callbacks.onError) {
        this.callbacks.onError(error)
      }
      this.setState("idle")
    })
  }

  // Changer l'état
  private setState(state: ConversationState) {
    this.currentState = state
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(state)
    }
  }

  // Gérer la parole de l'utilisateur
  private async handleUserSpeech(transcript: string) {
    // Parser la commande
    const command = voiceCommandsParser.parse(transcript)

    // Si c'est une commande spéciale
    if (command.type !== "message") {
      this.handleCommand(command)
      return
    }

    // Sinon, c'est un message normal
    if (this.callbacks.onUserMessage) {
      this.callbacks.onUserMessage(transcript)
    }

    // Envoyer le message pour traitement IA
    if (this.callbacks.onAssistantResponse) {
      try {
        await this.callbacks.onAssistantResponse(transcript)
      } catch (error) {
        console.error("Erreur traitement message:", error)
        if (this.callbacks.onError) {
          this.callbacks.onError("Erreur lors du traitement de votre message")
        }
        // Redémarrer l'écoute
        if (this.isActive) {
          this.startListening()
        }
      }
    }
  }

  // Gérer une commande spéciale
  private handleCommand(command: VoiceCommand) {
    if (this.callbacks.onCommand) {
      this.callbacks.onCommand(command)
    }

    switch (command.type) {
      case "stop":
        this.stopSpeaking()
        if (this.isActive) {
          this.startListening()
        }
        break

      case "pause":
        this.pause()
        break

      case "resume":
        this.resume()
        break

      case "repeat":
        this.repeatLast()
        break

      case "faster":
        textToSpeechService.increaseRate()
        this.speakFeedback("Vitesse augmentée")
        break

      case "slower":
        textToSpeechService.decreaseRate()
        this.speakFeedback("Vitesse diminuée")
        break

      case "louder":
        textToSpeechService.increaseVolume()
        this.speakFeedback("Volume augmenté")
        break

      case "quieter":
        textToSpeechService.decreaseVolume()
        this.speakFeedback("Volume diminué")
        break

      case "help":
        const helpMessage = voiceCommandsParser.getHelpMessage()
        this.speak(helpMessage)
        break

      case "exit":
        this.stop()
        break
    }
  }

  // Démarrer l'écoute
  private startListening() {
    if (!voiceRecognitionService.isSupported()) {
      if (this.callbacks.onError) {
        this.callbacks.onError("La reconnaissance vocale n'est pas supportée")
      }
      return
    }

    voiceRecognitionService.start()
  }

  // Faire parler l'assistant
  async speak(text: string) {
    if (!textToSpeechService.isSupported()) {
      if (this.callbacks.onError) {
        this.callbacks.onError("La synthèse vocale n'est pas supportée")
      }
      return
    }

    this.lastAssistantMessage = text

    try {
      await textToSpeechService.speak(text)
    } catch (error) {
      console.error("Erreur lecture vocale:", error)
    }
  }

  // Feedback court (sans redémarrage auto de l'écoute)
  private async speakFeedback(text: string) {
    const previousAutoRestart = this.autoRestartListening
    this.autoRestartListening = false

    await this.speak(text)

    this.autoRestartListening = previousAutoRestart

    // Redémarrer l'écoute manuellement
    if (this.isActive) {
      setTimeout(() => {
        if (this.isActive) {
          this.startListening()
        }
      }, 500)
    }
  }

  // Arrêter de parler
  stopSpeaking() {
    textToSpeechService.stop()
  }

  // Pause
  pause() {
    textToSpeechService.pause()
  }

  // Reprendre
  resume() {
    textToSpeechService.resume()
  }

  // Répéter le dernier message
  async repeatLast() {
    if (this.lastAssistantMessage) {
      await this.speak(this.lastAssistantMessage)
    }
  }

  // Démarrer le mode conversation
  start() {
    if (!voiceRecognitionService.isSupported() || !textToSpeechService.isSupported()) {
      if (this.callbacks.onError) {
        this.callbacks.onError(
          "Votre navigateur ne supporte pas la conversation vocale complète"
        )
      }
      return
    }

    this.isActive = true
    this.autoRestartListening = true

    // Message de bienvenue
    this.speak("Mode conversation vocale activé. Je vous écoute.")
  }

  // Arrêter le mode conversation
  stop() {
    this.isActive = false
    this.autoRestartListening = false
    voiceRecognitionService.stop()
    textToSpeechService.stop()
    this.setState("idle")
  }

  // État
  getIsActive(): boolean {
    return this.isActive
  }

  getCurrentState(): ConversationState {
    return this.currentState
  }

  // Callbacks
  setCallbacks(callbacks: ConversationCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  // Vérifier le support
  isSupported(): boolean {
    return (
      voiceRecognitionService.isSupported() && textToSpeechService.isSupported()
    )
  }
}

// Instance singleton
export const voiceConversationOrchestrator = new VoiceConversationOrchestrator()
