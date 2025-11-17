import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenerativeAI(apiKey)

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

export interface GeminiConfig {
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
}

export class GeminiService {
  private model: any
  private config: GeminiConfig

  constructor(config?: GeminiConfig) {
    this.config = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
      ...config,
    }

    this.model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: this.config,
    })
  }

  async chat(messages: ChatMessage[], context?: any): Promise<string> {
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
    } catch (error) {
      console.error("Erreur Gemini:", error)
      throw new Error("Impossible de communiquer avec Gemini. Vérifiez votre clé API.")
    }
  }

  async generateInsight(data: any, query: string): Promise<string> {
    try {
      const prompt = `En tant qu'analyste commercial expert, analyse ces données et réponds à la question suivante :

Données :
${JSON.stringify(data, null, 2)}

Question : ${query}

Fournis une réponse structurée avec :
1. Analyse des données
2. Insights clés
3. Recommandations d'actions`

      const result = await this.model.generateContent(prompt)
      const response = result.response
      return response.text()
    } catch (error) {
      console.error("Erreur génération insight:", error)
      throw new Error("Impossible de générer l'insight")
    }
  }

  async suggestActions(businessContext: any): Promise<string[]> {
    try {
      const prompt = `En tant qu'expert commercial, analyse ce contexte business et suggère 3-5 actions prioritaires concrètes :

${JSON.stringify(businessContext, null, 2)}

Retourne uniquement une liste d'actions au format JSON array de strings.`

      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      try {
        const actions = JSON.parse(text)
        return Array.isArray(actions) ? actions : []
      } catch {
        // Si le parsing JSON échoue, extraire les actions manuellement
        const lines = text.split("\n").filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+\./))
        return lines.map((line) => line.replace(/^[-\d.]\s*/, "").trim())
      }
    } catch (error) {
      console.error("Erreur suggestion actions:", error)
      return []
    }
  }
}

// Instance singleton
export const geminiService = new GeminiService()
