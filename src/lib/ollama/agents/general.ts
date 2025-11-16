/**
 * Agent General - Conversations générales
 */

import { createOllamaClient, ollamaConfig } from '../client'
import { SYSTEM_PROMPTS } from '../prompts/system-prompts'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export class GeneralAgent {
  private llm = createOllamaClient(ollamaConfig.models.router, {
    temperature: 0.7,
  })

  /**
   * Répond à une question générale avec contexte de conversation
   */
  async chat(
    userMessage: string,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      // Construction des messages avec historique
      const messages = [
        new SystemMessage(SYSTEM_PROMPTS.general),
        ...this.buildMessageHistory(conversationHistory),
        new HumanMessage(userMessage),
      ]

      const response = await this.llm.invoke(messages)
      return response.content.toString()

    } catch (error) {
      console.error('[General] Erreur de conversation:', error)
      throw new Error('Impossible de répondre au message')
    }
  }

  /**
   * Construit l'historique de messages pour LangChain
   */
  private buildMessageHistory(history: ConversationMessage[]) {
    return history.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content)
      } else {
        return new AIMessage(msg.content)
      }
    })
  }
}
