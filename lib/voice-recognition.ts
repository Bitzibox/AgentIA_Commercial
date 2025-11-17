// Service de reconnaissance vocale pour les commandes
export class VoiceRecognitionService {
  private recognition: any = null
  private isListening = false
  private onResultCallback?: (transcript: string) => void
  private onErrorCallback?: (error: string) => void
  private onStateChangeCallback?: (isListening: boolean) => void

  constructor() {
    if (typeof window !== "undefined") {
      // Support pour différents navigateurs
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.setupRecognition()
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    // Configuration de la reconnaissance vocale
    this.recognition.continuous = false // Arrêt automatique après une phrase
    this.recognition.interimResults = false // Pas de résultats intermédiaires
    this.recognition.lang = "fr-FR" // Langue française

    // Événement: résultat obtenu
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Transcription:", transcript)

      if (this.onResultCallback) {
        this.onResultCallback(transcript)
      }
    }

    // Événement: fin de l'écoute
    this.recognition.onend = () => {
      this.isListening = false
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false)
      }
    }

    // Événement: début de l'écoute
    this.recognition.onstart = () => {
      this.isListening = true
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(true)
      }
    }

    // Événement: erreur
    this.recognition.onerror = (event: any) => {
      console.error("Erreur reconnaissance vocale:", event.error)

      let errorMessage = "Erreur de reconnaissance vocale"

      switch (event.error) {
        case "no-speech":
          errorMessage = "Aucun son détecté. Veuillez parler plus fort."
          break
        case "audio-capture":
          errorMessage = "Microphone non disponible. Vérifiez les permissions."
          break
        case "not-allowed":
          errorMessage = "Permission microphone refusée. Veuillez autoriser l'accès."
          break
        case "network":
          errorMessage = "Erreur réseau. Vérifiez votre connexion internet."
          break
        default:
          errorMessage = `Erreur: ${event.error}`
      }

      if (this.onErrorCallback) {
        this.onErrorCallback(errorMessage)
      }

      this.isListening = false
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback(false)
      }
    }
  }

  // Vérifier si le navigateur supporte la reconnaissance vocale
  isSupported(): boolean {
    return this.recognition !== null
  }

  // Démarrer l'écoute
  start() {
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback("La reconnaissance vocale n'est pas supportée par votre navigateur.")
      }
      return
    }

    if (this.isListening) {
      return // Déjà en écoute
    }

    try {
      this.recognition.start()
    } catch (error) {
      console.error("Erreur démarrage reconnaissance:", error)
      if (this.onErrorCallback) {
        this.onErrorCallback("Impossible de démarrer la reconnaissance vocale.")
      }
    }
  }

  // Arrêter l'écoute
  stop() {
    if (!this.recognition || !this.isListening) {
      return
    }

    try {
      this.recognition.stop()
    } catch (error) {
      console.error("Erreur arrêt reconnaissance:", error)
    }
  }

  // Définir le callback pour les résultats
  onResult(callback: (transcript: string) => void) {
    this.onResultCallback = callback
  }

  // Définir le callback pour les erreurs
  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback
  }

  // Définir le callback pour les changements d'état
  onStateChange(callback: (isListening: boolean) => void) {
    this.onStateChangeCallback = callback
  }

  // Obtenir l'état actuel
  getIsListening(): boolean {
    return this.isListening
  }
}

// Instance singleton
export const voiceRecognitionService = new VoiceRecognitionService()
