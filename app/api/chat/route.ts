import { NextRequest, NextResponse } from "next/server"
import { geminiService, ChatMessage } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 }
      )
    }

    // Vérifier que la clé API Gemini est configurée
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "Configuration manquante",
          message: "La clé API Gemini n'est pas configurée. Veuillez créer un fichier .env avec GEMINI_API_KEY=votre_cle"
        },
        { status: 500 }
      )
    }

    // Appeler Gemini
    const response = await geminiService.chat(messages as ChatMessage[], context)

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        error: "Erreur lors du traitement de la requête",
        message: error.message || "Une erreur inconnue s'est produite"
      },
      { status: 500 }
    )
  }
}
