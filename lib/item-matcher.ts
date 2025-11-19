// Système de correspondance d'items pour la modification vocale
// Utilise un matching flou pour identifier les deals et actions existants

import { Deal, ActionItem } from '@/types'

export interface MatchResult<T> {
  item: T
  confidence: number
}

export class ItemMatcher {
  /**
   * Trouver une opportunité par nom de client/entreprise
   */
  static findDeal(deals: Deal[], query: string): MatchResult<Deal> | null {
    if (!query || deals.length === 0) return null

    const normalizedQuery = this.normalize(query)
    const matches: MatchResult<Deal>[] = []

    for (const deal of deals) {
      const companyName = deal.company || deal.client || ''
      const normalizedCompany = this.normalize(companyName)

      // Calcul de la similarité
      const similarity = this.calculateSimilarity(normalizedQuery, normalizedCompany)

      // Seuil de confiance: 0.6
      if (similarity >= 0.6) {
        matches.push({ item: deal, confidence: similarity })
      }
    }

    // Trier par confiance décroissante
    matches.sort((a, b) => b.confidence - a.confidence)

    // Si plusieurs matches avec confiance similaire (différence < 0.1), c'est ambigu
    if (matches.length > 1 && matches[0].confidence - matches[1].confidence < 0.1) {
      console.log('[ItemMatcher] Plusieurs deals trouvés avec confiance similaire:', matches)
      return null // Ambiguïté
    }

    return matches[0] || null
  }

  /**
   * Trouver une action par titre ou contact
   */
  static findAction(actions: ActionItem[], query: string): MatchResult<ActionItem> | null {
    if (!query || actions.length === 0) return null

    const normalizedQuery = this.normalize(query)
    const matches: MatchResult<ActionItem>[] = []

    for (const action of actions) {
      let bestSimilarity = 0

      // Vérifier le titre
      if (action.title) {
        const normalizedTitle = this.normalize(action.title)
        const titleSimilarity = this.calculateSimilarity(normalizedQuery, normalizedTitle)
        bestSimilarity = Math.max(bestSimilarity, titleSimilarity)
      }

      // Vérifier le nom du contact/entreprise dans relatedTo
      if (action.relatedTo?.name) {
        const normalizedRelated = this.normalize(action.relatedTo.name)
        const relatedSimilarity = this.calculateSimilarity(normalizedQuery, normalizedRelated)
        bestSimilarity = Math.max(bestSimilarity, relatedSimilarity)
      }

      // Seuil de confiance: 0.6
      if (bestSimilarity >= 0.6) {
        matches.push({ item: action, confidence: bestSimilarity })
      }
    }

    // Trier par confiance décroissante
    matches.sort((a, b) => b.confidence - a.confidence)

    // Si plusieurs matches avec confiance similaire (différence < 0.1), c'est ambigu
    if (matches.length > 1 && matches[0].confidence - matches[1].confidence < 0.1) {
      console.log('[ItemMatcher] Plusieurs actions trouvées avec confiance similaire:', matches)
      return null // Ambiguïté
    }

    return matches[0] || null
  }

  /**
   * Normaliser une chaîne pour la comparaison
   */
  private static normalize(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD') // Décomposer les accents
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques
      .replace(/[^a-z0-9\s]/g, '') // Supprimer la ponctuation
      .replace(/\s+/g, ' ') // Normaliser les espaces
      .trim()
  }

  /**
   * Calculer la similarité entre deux chaînes
   * Utilise l'algorithme de distance de Levenshtein normalisée
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    // Cas simples
    if (str1 === str2) return 1.0
    if (str1.length === 0 || str2.length === 0) return 0.0

    // Vérifier si l'un contient l'autre (substring)
    if (str1.includes(str2) || str2.includes(str1)) {
      const longerLength = Math.max(str1.length, str2.length)
      const shorterLength = Math.min(str1.length, str2.length)
      return shorterLength / longerLength
    }

    // Distance de Levenshtein
    const distance = this.levenshteinDistance(str1, str2)
    const maxLength = Math.max(str1.length, str2.length)

    // Normaliser: 1.0 = identique, 0.0 = totalement différent
    return 1.0 - (distance / maxLength)
  }

  /**
   * Calculer la distance de Levenshtein entre deux chaînes
   * (nombre minimum d'opérations pour transformer str1 en str2)
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    // Initialisation
    for (let i = 0; i <= str1.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str2.length; j++) {
      matrix[0][j] = j
    }

    // Remplissage de la matrice
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // suppression
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        )
      }
    }

    return matrix[str1.length][str2.length]
  }

  /**
   * Trouver tous les deals qui correspondent (utile pour déboggage ou suggestions)
   */
  static findAllMatchingDeals(deals: Deal[], query: string, threshold: number = 0.6): MatchResult<Deal>[] {
    if (!query || deals.length === 0) return []

    const normalizedQuery = this.normalize(query)
    const matches: MatchResult<Deal>[] = []

    for (const deal of deals) {
      const companyName = deal.company || deal.client || ''
      const normalizedCompany = this.normalize(companyName)
      const similarity = this.calculateSimilarity(normalizedQuery, normalizedCompany)

      if (similarity >= threshold) {
        matches.push({ item: deal, confidence: similarity })
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Trouver toutes les actions qui correspondent (utile pour déboggage ou suggestions)
   */
  static findAllMatchingActions(actions: ActionItem[], query: string, threshold: number = 0.6): MatchResult<ActionItem>[] {
    if (!query || actions.length === 0) return []

    const normalizedQuery = this.normalize(query)
    const matches: MatchResult<ActionItem>[] = []

    for (const action of actions) {
      let bestSimilarity = 0

      if (action.title) {
        const normalizedTitle = this.normalize(action.title)
        const titleSimilarity = this.calculateSimilarity(normalizedQuery, normalizedTitle)
        bestSimilarity = Math.max(bestSimilarity, titleSimilarity)
      }

      if (action.relatedTo?.name) {
        const normalizedRelated = this.normalize(action.relatedTo.name)
        const relatedSimilarity = this.calculateSimilarity(normalizedQuery, normalizedRelated)
        bestSimilarity = Math.max(bestSimilarity, relatedSimilarity)
      }

      if (bestSimilarity >= threshold) {
        matches.push({ item: action, confidence: bestSimilarity })
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence)
  }
}
