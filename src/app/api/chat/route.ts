/**
 * API Route pour le chat avec Ollama
 *
 * Cette route orchestre les différents agents selon l'intention de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server'
import { RouterAgent, GeneralAgent, SalesAnalystAgent, EmailWriterAgent } from '@/lib/ollama/agents'
import { prisma } from '@/lib/db/prisma'
import { nanoid } from 'nanoid'

interface ChatRequestBody {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  userId?: string
  conversationId?: string
  context?: {
    dealId?: string
    contactId?: string
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: ChatRequestBody = await request.json()

    // Validation
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: 'Messages invalides' },
        { status: 400 }
      )
    }

    if (body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Aucun message fourni' },
        { status: 400 }
      )
    }

    const lastMessage = body.messages[body.messages.length - 1]

    if (lastMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Le dernier message doit être de l\'utilisateur' },
        { status: 400 }
      )
    }

    const userMessage = lastMessage.content

    // Étape 1 : Router l'intention
    const router = new RouterAgent()
    const agentType = await router.route(userMessage)

    console.log(`[Chat] Route vers agent: ${agentType}`)

    let response: string
    let usedAgent: string = agentType

    // Étape 2 : Appeler l'agent approprié
    switch (agentType) {
      case 'SALES_ANALYSIS': {
        // TODO: Récupérer les vraies données du pipeline depuis la DB
        const mockPipelineData = await getMockPipelineData(body.userId)
        const analyst = new SalesAnalystAgent()

        response = await analyst.analyze(
          userMessage,
          mockPipelineData,
          { name: 'Votre entreprise' }
        )
        break
      }

      case 'EMAIL_WRITING': {
        const writer = new EmailWriterAgent()
        // TODO: Extraire le contexte et le type d'email de la requête
        const emailResult = await writer.writeEmail(
          'custom',
          {},
          userMessage
        )

        response = `**Objet :** ${emailResult.subject}\n\n${emailResult.body}`
        break
      }

      case 'CRM_UPDATE':
      case 'COACHING':
      case 'GENERAL':
      default: {
        const general = new GeneralAgent()
        const conversationHistory = body.messages.slice(0, -1)
        response = await general.chat(userMessage, conversationHistory)
        usedAgent = 'GENERAL'
        break
      }
    }

    const processingTime = Date.now() - startTime

    // Étape 3 : Sauvegarder la conversation (optionnel)
    if (body.userId && body.conversationId) {
      try {
        await saveConversationMessage(
          body.conversationId,
          body.userId,
          userMessage,
          response,
          usedAgent,
          processingTime
        )
      } catch (error) {
        console.error('[Chat] Erreur sauvegarde conversation:', error)
        // On continue même si la sauvegarde échoue
      }
    }

    // Réponse
    return NextResponse.json({
      message: {
        role: 'assistant',
        content: response,
      },
      metadata: {
        agentType: usedAgent,
        processingTime,
      },
    })

  } catch (error) {
    console.error('[Chat] Erreur:', error)

    return NextResponse.json(
      {
        error: 'Une erreur est survenue lors du traitement de votre demande',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}

/**
 * Récupère les données du pipeline (mock pour Phase 1)
 */
async function getMockPipelineData(userId?: string) {
  // TODO: Récupérer depuis la vraie DB avec Prisma
  return {
    totalDeals: 12,
    totalValue: 245000,
    averageValue: 20416,
    conversionRate: 24.5,
    topDeals: [
      {
        title: 'Enterprise Solutions LLC',
        value: 50000,
        stage: 'negotiation' as const,
        probability: 75,
      },
      {
        title: 'Tech Innovators Inc',
        value: 35000,
        stage: 'proposal' as const,
        probability: 60,
      },
      {
        title: 'Digital Transform SA',
        value: 28000,
        stage: 'qualification' as const,
        probability: 40,
      },
    ],
    dealsByStage: {
      discovery: 3,
      qualification: 4,
      proposal: 2,
      negotiation: 2,
      closed_won: 1,
      closed_lost: 0,
    },
  }
}

/**
 * Sauvegarde les messages de conversation
 */
async function saveConversationMessage(
  conversationId: string,
  userId: string,
  userMessage: string,
  assistantResponse: string,
  agentType: string,
  processingTime: number
) {
  // Vérifier si la conversation existe
  let conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  // Créer la conversation si elle n'existe pas
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        id: conversationId,
        userId: userId,
        title: userMessage.substring(0, 50), // Titre basé sur le premier message
      },
    })
  }

  // Sauvegarder le message utilisateur
  await prisma.message.create({
    data: {
      id: nanoid(),
      conversationId: conversationId,
      role: 'user',
      content: userMessage,
    },
  })

  // Sauvegarder la réponse assistant
  await prisma.message.create({
    data: {
      id: nanoid(),
      conversationId: conversationId,
      role: 'assistant',
      content: assistantResponse,
      agentType: agentType,
      processingTime: processingTime,
    },
  })
}
