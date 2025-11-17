import { GoogleGenerativeAI } from "@google/generative-ai"

// System prompt pour l'agent commercial
const SYSTEM_PROMPT = `Tu es un assistant commercial IA expert, le copilote personnel d'un dirigeant de TPE/PME.

Ton rôle est d'aider dans tous les aspects commerciaux :
- Analyse des ventes et du pipeline
- Conseils stratégiques commerciaux
- Priorisation des opportunités
- Préparation de rendez-vous clients
- Analyse de la concurrence
- Recommandations d'actions concrètes
- Suivi des KPIs commerciaux
- Détection d'opportunités de croissance

Contexte de l'utilisateur :
- Dirigeant de TPE/PME
- Besoin d'insights actionnables et rapides
- Préfère des réponses concises mais complètes
- Recherche des conseils pratiques et applicables immédiatement

Style de communication :
- Professionnel mais accessible
- Direct et orienté résultats
- Utilise des exemples concrets
- Propose toujours des actions à entreprendre
- En français

Capacités spéciales :
- Tu peux analyser des données commerciales
- Tu peux générer des prévisions
- Tu peux suggérer des stratégies de vente
- Tu peux aider à préparer des argumentaires
- Tu peux identifier des risques et opportunités`

export interface ChatMessage {
  role: "user" | "model"
  parts: string
}

export class GeminiClientService {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null
  private apiKey: string | null = null

  constructor() {
    // La clé API sera fournie par l'utilisateur
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("gemini_api_key")
      if (storedKey) {
        this.setApiKey(storedKey)
      }
    }
  }

  setApiKey(key: string) {
    this.apiKey = key
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", key)
    }
    this.genAI = new GoogleGenerativeAI(key)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })
  }

  hasApiKey(): boolean {
    return !!this.apiKey
  }

  getApiKey(): string | null {
    return this.apiKey
  }

  clearApiKey() {
    this.apiKey = null
    this.genAI = null
    this.model = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("gemini_api_key")
    }
  }

  async chat(messages: ChatMessage[], context?: any): Promise<string> {
    if (!this.model) {
      throw new Error("Clé API Gemini non configurée. Veuillez configurer votre clé API.")
    }

    try {
      // Construire l'historique de conversation
      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.parts }],
      }))

      // Ajouter le contexte business si disponible
      let systemMessage = SYSTEM_PROMPT
      if (context) {
        systemMessage += `\n\nContexte business actuel :\n${JSON.stringify(context, null, 2)}`
      }

      // Démarrer une session de chat
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemMessage }],
          },
          {
            role: "model",
            parts: [{ text: "Compris. Je suis prêt à vous assister dans vos activités commerciales." }],
          },
          ...history,
        ],
      })

      // Envoyer le dernier message
      const lastMessage = messages[messages.length - 1]
      const result = await chat.sendMessage(lastMessage.parts)
      const response = result.response
      return response.text()
    } catch (error: any) {
      console.error("Erreur Gemini:", error)
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key")) {
        throw new Error("Clé API Gemini invalide. Veuillez vérifier votre clé API.")
      }
      throw new Error("Impossible de communiquer avec Gemini. Vérifiez votre connexion internet et votre clé API.")
    }
  }
}

// Instance singleton
export const geminiClientService = new GeminiClientService()
