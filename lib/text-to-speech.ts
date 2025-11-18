// Service de synthèse vocale (Text-to-Speech)
export interface VoiceSettings {
  voice?: SpeechSynthesisVoice
  rate: number // Vitesse (0.1 à 10)
  pitch: number // Tonalité (0 à 2)
  volume: number // Volume (0 à 1)
  lang: string // Langue
}

export class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isSpeaking = false
  private isPaused = false
  private voices: SpeechSynthesisVoice[] = []

  // Callbacks
  private onStartCallback?: () => void
  private onEndCallback?: () => void
  private onPauseCallback?: () => void
  private onResumeCallback?: () => void
  private onErrorCallback?: (error: string) => void

  // Paramètres par défaut
  private settings: VoiceSettings = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    lang: "fr-FR",
  }

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis
      this.loadVoices()

      // Les voix peuvent ne pas être immédiatement disponibles
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = () => {
          this.loadVoices()
        }
      }
    }
  }

  // Charger les voix disponibles
  private loadVoices() {
    if (!this.synthesis) return

    this.voices = this.synthesis.getVoices()

    // Sélectionner une voix française par défaut
    const frenchVoice = this.voices.find(
      (voice) => voice.lang.startsWith("fr") && voice.name.includes("Google")
    ) || this.voices.find(
      (voice) => voice.lang.startsWith("fr")
    )

    if (frenchVoice) {
      this.settings.voice = frenchVoice
    }
  }

  // Vérifier si le service est supporté
  isSupported(): boolean {
    return this.synthesis !== null
  }

  // Obtenir la liste des voix disponibles
  getVoices(): SpeechSynthesisVoice[] {
    return this.voices
  }

  // Obtenir les voix françaises
  getFrenchVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((voice) => voice.lang.startsWith("fr"))
  }

  // Configurer les paramètres
  setSettings(settings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  // Obtenir les paramètres actuels
  getSettings(): VoiceSettings {
    return { ...this.settings }
  }

  // Parler (lire un texte)
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        const error = "La synthèse vocale n'est pas supportée"
        if (this.onErrorCallback) this.onErrorCallback(error)
        reject(new Error(error))
        return
      }

      // Annuler toute parole en cours
      this.stop()

      // Créer une nouvelle utterance
      this.currentUtterance = new SpeechSynthesisUtterance(text)

      // Appliquer les paramètres
      this.currentUtterance.rate = this.settings.rate
      this.currentUtterance.pitch = this.settings.pitch
      this.currentUtterance.volume = this.settings.volume
      this.currentUtterance.lang = this.settings.lang

      if (this.settings.voice) {
        this.currentUtterance.voice = this.settings.voice
      }

      // Événements
      this.currentUtterance.onstart = () => {
        this.isSpeaking = true
        this.isPaused = false
        if (this.onStartCallback) this.onStartCallback()
      }

      this.currentUtterance.onend = () => {
        this.isSpeaking = false
        this.isPaused = false
        if (this.onEndCallback) this.onEndCallback()
        resolve()
      }

      this.currentUtterance.onpause = () => {
        this.isPaused = true
        if (this.onPauseCallback) this.onPauseCallback()
      }

      this.currentUtterance.onresume = () => {
        this.isPaused = false
        if (this.onResumeCallback) this.onResumeCallback()
      }

      this.currentUtterance.onerror = (event) => {
        this.isSpeaking = false
        this.isPaused = false
        const error = `Erreur synthèse vocale: ${event.error}`
        console.error(error)
        if (this.onErrorCallback) this.onErrorCallback(error)
        reject(new Error(error))
      }

      // Démarrer la synthèse
      try {
        this.synthesis.speak(this.currentUtterance)
      } catch (error) {
        const errorMsg = "Erreur lors du démarrage de la synthèse vocale"
        console.error(errorMsg, error)
        if (this.onErrorCallback) this.onErrorCallback(errorMsg)
        reject(error)
      }
    })
  }

  // Mettre en pause
  pause() {
    if (!this.synthesis || !this.isSpeaking || this.isPaused) return

    try {
      this.synthesis.pause()
    } catch (error) {
      console.error("Erreur pause:", error)
    }
  }

  // Reprendre
  resume() {
    if (!this.synthesis || !this.isPaused) return

    try {
      this.synthesis.resume()
    } catch (error) {
      console.error("Erreur reprise:", error)
    }
  }

  // Arrêter complètement
  stop() {
    if (!this.synthesis) return

    try {
      this.synthesis.cancel()
      this.isSpeaking = false
      this.isPaused = false
      this.currentUtterance = null
    } catch (error) {
      console.error("Erreur arrêt:", error)
    }
  }

  // État
  getIsSpeaking(): boolean {
    return this.isSpeaking
  }

  getIsPaused(): boolean {
    return this.isPaused
  }

  // Callbacks
  onStart(callback: () => void) {
    this.onStartCallback = callback
  }

  onEnd(callback: () => void) {
    this.onEndCallback = callback
  }

  onPause(callback: () => void) {
    this.onPauseCallback = callback
  }

  onResume(callback: () => void) {
    this.onResumeCallback = callback
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback
  }

  // Utilitaires pour ajuster les paramètres
  increaseRate() {
    this.settings.rate = Math.min(this.settings.rate + 0.1, 2.0)
  }

  decreaseRate() {
    this.settings.rate = Math.max(this.settings.rate - 0.1, 0.5)
  }

  increaseVolume() {
    this.settings.volume = Math.min(this.settings.volume + 0.1, 1.0)
  }

  decreaseVolume() {
    this.settings.volume = Math.max(this.settings.volume - 0.1, 0.0)
  }
}

// Instance singleton
export const textToSpeechService = new TextToSpeechService()
