/**
 * Client Ollama pour AgentIA Commercial
 *
 * Ce module gère la connexion avec Ollama et fournit
 * des clients pré-configurés pour différents usages
 */

import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { Ollama } from 'ollama'

// Configuration Ollama
export const ollamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  models: {
    router: process.env.OLLAMA_ROUTER_MODEL || 'mistral:7b-instruct',
    analyst: process.env.OLLAMA_ANALYST_MODEL || 'mixtral:8x7b',
    writer: process.env.OLLAMA_WRITER_MODEL || 'mistral:7b-instruct',
    coach: process.env.OLLAMA_COACH_MODEL || 'llama3.1:8b',
    embeddings: process.env.OLLAMA_EMBEDDINGS_MODEL || 'nomic-embed-text',
  },
  defaultTemp: 0.7,
  defaultContext: 4096,
}

/**
 * Crée un client Ollama via LangChain pour les conversations
 */
export function createOllamaClient(
  modelName: string,
  options?: {
    temperature?: number
    numCtx?: number
    topP?: number
    topK?: number
  }
) {
  return new ChatOllama({
    baseUrl: ollamaConfig.baseUrl,
    model: modelName,
    temperature: options?.temperature ?? ollamaConfig.defaultTemp,
    numCtx: options?.numCtx ?? ollamaConfig.defaultContext,
    topP: options?.topP,
    topK: options?.topK,
  })
}

/**
 * Crée un client Ollama natif pour les opérations bas niveau
 */
export function createNativeOllamaClient() {
  return new Ollama({
    host: ollamaConfig.baseUrl,
  })
}

/**
 * Génère un embedding pour le RAG
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = createNativeOllamaClient()

  try {
    const response = await client.embeddings({
      model: ollamaConfig.models.embeddings,
      prompt: text,
    })

    return response.embedding
  } catch (error) {
    console.error('[Ollama] Erreur génération embedding:', error)
    throw new Error('Impossible de générer l\'embedding')
  }
}

/**
 * Vérifie la disponibilité d'Ollama et des modèles
 */
export async function checkOllamaHealth(): Promise<{
  available: boolean
  models: string[]
  error?: string
}> {
  try {
    const client = createNativeOllamaClient()
    const modelsList = await client.list()

    return {
      available: true,
      models: modelsList.models.map(m => m.name),
    }
  } catch (error) {
    console.error('[Ollama] Erreur connexion:', error)
    return {
      available: false,
      models: [],
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Liste les modèles disponibles
 */
export async function listAvailableModels(): Promise<string[]> {
  const health = await checkOllamaHealth()
  return health.models
}
