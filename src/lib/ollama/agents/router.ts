/**
 * Agent Router - Analyse l'intention et route vers le bon agent
 */

import { createOllamaClient, ollamaConfig } from '../client'
import { SYSTEM_PROMPTS } from '../prompts/system-prompts'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

export type AgentType =
  | 'SALES_ANALYSIS'
  | 'EMAIL_WRITING'
  | 'CRM_UPDATE'
  | 'COACHING'
  | 'GENERAL'

export class RouterAgent {
  private llm = createOllamaClient(ollamaConfig.models.router, {
    temperature: 0.1, // Très déterministe pour le routing
  })

  /**
   * Analyse le message et retourne le type d'agent à utiliser
   */
  async route(userMessage: string): Promise<AgentType> {
    try {
      const messages = [
        new SystemMessage(SYSTEM_PROMPTS.router),
        new HumanMessage(userMessage),
      ]

      const response = await this.llm.invoke(messages)
      const classification = response.content.toString().trim().toUpperCase()

      // Validation de la réponse
      const validTypes: AgentType[] = [
        'SALES_ANALYSIS',
        'EMAIL_WRITING',
        'CRM_UPDATE',
        'COACHING',
        'GENERAL',
      ]

      if (validTypes.includes(classification as AgentType)) {
        return classification as AgentType
      }

      // Fallback sur GENERAL si classification invalide
      console.warn(`[Router] Classification invalide: ${classification}`)
      return 'GENERAL'

    } catch (error) {
      console.error('[Router] Erreur de routing:', error)
      return 'GENERAL' // Fallback safe
    }
  }

  /**
   * Version avec contexte de conversation
   */
  async routeWithContext(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<AgentType> {
    // Pour l'instant, on route juste sur le dernier message
    // TODO: Améliorer avec l'analyse du contexte
    return this.route(userMessage)
  }
}
