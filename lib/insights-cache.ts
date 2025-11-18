import { AIInsight } from "@/lib/ai-insights"
import { SuggestedAction } from "@/lib/ai-insights-gemini"

/**
 * Service singleton pour cacher les insights IA en mémoire
 * Persiste même quand les composants React se démontent/remontent
 */
class InsightsCacheService {
  private insights: AIInsight[] = []
  private actions: SuggestedAction[] = []
  private isGenerated: boolean = false
  private lastGenerationTime: number = 0

  /**
   * Vérifie si les insights ont déjà été générés
   */
  hasInsights(): boolean {
    return this.isGenerated && this.insights.length > 0
  }

  /**
   * Récupère les insights en cache
   */
  getInsights(): { insights: AIInsight[], actions: SuggestedAction[] } {
    return {
      insights: this.insights,
      actions: this.actions
    }
  }

  /**
   * Stocke les insights en cache
   */
  setInsights(insights: AIInsight[], actions: SuggestedAction[]): void {
    this.insights = insights
    this.actions = actions
    this.isGenerated = true
    this.lastGenerationTime = Date.now()
    console.log('[InsightsCache] Insights cached:', insights.length, 'insights,', actions.length, 'actions')
  }

  /**
   * Réinitialise le cache (pour forcer une nouvelle génération)
   */
  clear(): void {
    this.insights = []
    this.actions = []
    this.isGenerated = false
    this.lastGenerationTime = 0
    console.log('[InsightsCache] Cache cleared')
  }

  /**
   * Récupère le timestamp de la dernière génération
   */
  getLastGenerationTime(): number {
    return this.lastGenerationTime
  }
}

// Export singleton instance
export const insightsCache = new InsightsCacheService()
