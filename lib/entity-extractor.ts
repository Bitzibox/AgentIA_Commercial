// Extracteur d'entités pour compléter les informations extraites

import { Deal, ActionItem } from '@/types'

export class EntityExtractor {
  /**
   * Créer un deal à partir des entités extraites
   */
  static createDealFromEntities(entities: Record<string, any>): Partial<Deal> {
    const now = new Date()
    const defaultCloseDate = new Date(now)
    defaultCloseDate.setMonth(defaultCloseDate.getMonth() + 1)

    return {
      client: entities.client || 'Client inconnu',
      amount: entities.amount || 0,
      status: entities.status || 'prospect',
      probability: entities.probability || 50,
      expectedCloseDate: entities.expectedCloseDate || defaultCloseDate.toISOString().split('T')[0],
      description: entities.description || '',
    }
  }

  /**
   * Créer une action à partir des entités extraites
   */
  static createActionFromEntities(entities: Record<string, any>): Partial<ActionItem> {
    const now = new Date()
    const defaultDate = new Date(now)
    defaultDate.setDate(defaultDate.getDate() + 1)

    // Construire le titre
    let title = ''
    if (entities.type === 'call') {
      title = `Appeler ${entities.contact || 'client'}`
    } else if (entities.type === 'email') {
      title = `Envoyer email à ${entities.contact || 'client'}`
    } else if (entities.type === 'meeting') {
      title = `Rendez-vous avec ${entities.contact || 'client'}`
    } else {
      title = entities.title || 'Nouvelle action'
    }

    // Construire la description
    let description = entities.description || ''
    if (!description && entities.contact) {
      if (entities.type === 'call') {
        description = `Appeler ${entities.contact}`
      } else if (entities.type === 'meeting') {
        description = `Rendez-vous avec ${entities.contact}`
      }

      if (entities.time) {
        description += ` à ${entities.time}`
      }
    }

    return {
      title,
      description,
      type: entities.type || 'call',
      priority: entities.priority || 'medium',
      status: 'todo',
      dueDate: entities.dueDate || defaultDate.toISOString().split('T')[0],
    }
  }

  /**
   * Mettre à jour un deal avec des modifications
   */
  static updateDealWithModifications(deal: Partial<Deal>, modifications: Record<string, any>): Partial<Deal> {
    return {
      ...deal,
      ...modifications,
      // S'assurer que les types sont corrects
      amount: modifications.amount !== undefined ? modifications.amount : deal.amount,
      probability: modifications.probability !== undefined ? modifications.probability : deal.probability,
    }
  }

  /**
   * Mettre à jour une action avec des modifications
   */
  static updateActionWithModifications(
    action: Partial<ActionItem>,
    modifications: Record<string, any>
  ): Partial<ActionItem> {
    const updated = { ...action, ...modifications }

    // Mettre à jour le titre si l'heure change
    if (modifications.time && action.title) {
      // Remplacer l'heure dans le titre s'il y en a une
      updated.title = action.title.replace(/\d+h\d*/g, modifications.time)

      // Ou ajouter l'heure si elle n'y est pas
      if (!action.title.match(/\d+h/)) {
        updated.title = `${action.title} à ${modifications.time}`
      }
    }

    return updated
  }

  /**
   * Valider et nettoyer les données d'un deal
   */
  static validateDeal(deal: Partial<Deal>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!deal.client || deal.client.trim() === '' || deal.client === 'Client inconnu') {
      errors.push('Le nom du client est requis')
    }

    if (!deal.amount || deal.amount <= 0) {
      errors.push('Le montant doit être supérieur à 0')
    }

    if (deal.probability !== undefined && (deal.probability < 0 || deal.probability > 100)) {
      errors.push('La probabilité doit être entre 0 et 100')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Valider et nettoyer les données d'une action
   */
  static validateAction(action: Partial<ActionItem>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!action.title || action.title.trim() === '') {
      errors.push('Le titre est requis')
    }

    if (!action.type) {
      errors.push('Le type est requis')
    }

    if (!action.dueDate) {
      errors.push('La date est requise')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Générer un message de confirmation pour un deal
   */
  static generateDealConfirmation(deal: Partial<Deal>): string {
    let message = `Opportunité ${deal.client}`

    if (deal.amount) {
      message += ` pour ${this.formatCurrency(deal.amount)}`
    }

    if (deal.status) {
      const statusLabels: Record<string, string> = {
        prospect: 'statut prospect',
        proposal: 'proposition envoyée',
        negotiation: 'en négociation',
        won: 'gagnée',
        lost: 'perdue',
      }
      message += `, ${statusLabels[deal.status] || deal.status}`
    }

    if (deal.probability) {
      message += `, probabilité ${deal.probability}%`
    }

    return message
  }

  /**
   * Générer un message de confirmation pour une action
   */
  static generateActionConfirmation(action: Partial<ActionItem>): string {
    let message = action.title || 'Nouvelle action'

    if (action.dueDate) {
      const date = new Date(action.dueDate)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      if (date.toDateString() === today.toDateString()) {
        message += " aujourd'hui"
      } else if (date.toDateString() === tomorrow.toDateString()) {
        message += ' demain'
      } else {
        message += ` le ${this.formatDate(action.dueDate)}`
      }
    }

    if (action.priority === 'high') {
      message += ', priorité haute'
    }

    return message
  }

  /**
   * Formater un montant en devise
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Formater une date
   */
  private static formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
    }).format(date)
  }
}
