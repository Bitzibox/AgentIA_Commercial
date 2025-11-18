import { AIInsight } from "@/lib/ai-insights"
import { SuggestedAction } from "@/lib/ai-insights-gemini"

const STORAGE_KEY = 'agent-commercial-insights-cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 heures

interface CacheData {
  insights: AIInsight[]
  actions: SuggestedAction[]
  timestamp: number
  version: string
}

/**
 * Service singleton pour cacher les insights IA dans localStorage
 * Persiste même après refresh de la page et redémarrage du navigateur
 */
class InsightsCacheService {
  private version = '1.0.0'

  /**
   * Charge les données depuis localStorage
   */
  private loadFromStorage(): CacheData | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const data: CacheData = JSON.parse(stored)

      // Vérifier si le cache est expiré (plus de 24h)
      const now = Date.now()
      const age = now - data.timestamp
      if (age > CACHE_DURATION) {
        console.log('[InsightsCache] Cache expired (24h), clearing...')
        this.clear()
        return null
      }

      // Vérifier la version
      if (data.version !== this.version) {
        console.log('[InsightsCache] Version mismatch, clearing cache...')
        this.clear()
        return null
      }

      return data
    } catch (error) {
      console.error('[InsightsCache] Error loading from localStorage:', error)
      return null
    }
  }

  /**
   * Sauvegarde les données dans localStorage
   */
  private saveToStorage(insights: AIInsight[], actions: SuggestedAction[]): void {
    if (typeof window === 'undefined') return

    try {
      const data: CacheData = {
        insights,
        actions,
        timestamp: Date.now(),
        version: this.version
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('[InsightsCache] Saved to localStorage:', insights.length, 'insights,', actions.length, 'actions')
    } catch (error) {
      console.error('[InsightsCache] Error saving to localStorage:', error)
    }
  }

  /**
   * Vérifie si les insights ont déjà été générés et sont valides
   */
  hasInsights(): boolean {
    const data = this.loadFromStorage()
    return data !== null && data.insights.length > 0
  }

  /**
   * Récupère les insights en cache
   */
  getInsights(): { insights: AIInsight[], actions: SuggestedAction[] } {
    const data = this.loadFromStorage()

    if (!data) {
      return {
        insights: [],
        actions: []
      }
    }

    console.log('[InsightsCache] Loaded from localStorage:', data.insights.length, 'insights,', data.actions.length, 'actions')

    return {
      insights: data.insights,
      actions: data.actions
    }
  }

  /**
   * Stocke les insights en cache (localStorage)
   */
  setInsights(insights: AIInsight[], actions: SuggestedAction[]): void {
    this.saveToStorage(insights, actions)
  }

  /**
   * Réinitialise le cache (pour forcer une nouvelle génération)
   */
  clear(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[InsightsCache] Cache cleared from localStorage')
    } catch (error) {
      console.error('[InsightsCache] Error clearing localStorage:', error)
    }
  }

  /**
   * Récupère le timestamp de la dernière génération
   */
  getLastGenerationTime(): number {
    const data = this.loadFromStorage()
    return data?.timestamp || 0
  }

  /**
   * Récupère l'âge du cache en millisecondes
   */
  getCacheAge(): number {
    const data = this.loadFromStorage()
    if (!data) return 0
    return Date.now() - data.timestamp
  }

  /**
   * Récupère l'âge du cache en format lisible
   */
  getCacheAgeString(): string {
    const age = this.getCacheAge()
    if (age === 0) return 'Aucun cache'

    const hours = Math.floor(age / (60 * 60 * 1000))
    const minutes = Math.floor((age % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 0) {
      return `${hours}h ${minutes}min`
    }
    return `${minutes}min`
  }
}

// Export singleton instance
export const insightsCache = new InsightsCacheService()
