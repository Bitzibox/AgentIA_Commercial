// Système de détection d'intention pour comprendre ce que l'utilisateur veut faire

import { IntentDetection } from '@/types/voice'

export class IntentDetector {
  // Patterns pour détecter la création d'une opportunité
  private static dealPatterns = [
    /cr[ée]er?\s+(une\s+)?opportunit[ée]/i,
    /ajouter?\s+(une\s+)?opportunit[ée]/i,
    /nouvelle?\s+opportunit[ée]/i,
    /cr[ée]er?\s+(un\s+)?deal/i,
    /nouveau\s+deal/i,
    /nouvelle?\s+affaire/i,
    /prospect\s+(de|pour)/i,
    /client\s+(potentiel|pour)/i,
  ]

  // Patterns pour détecter la création d'une action
  private static actionPatterns = [
    /cr[ée]er?\s+(une\s+)?action/i,
    /ajouter?\s+(une\s+)?action/i,
    /nouvelle?\s+action/i,
    /(rappeler|appeler|contacter)/i,
    /envoyer\s+(un\s+)?(mail|email|message)/i,
    /(planifier|programmer|organiser)\s+(un\s+)?(rendez-vous|r[ée]union|meeting|appel)/i,
    /fixer\s+(un\s+)?(rendez-vous|meeting)/i,
    /(pr[ée]parer|rédiger)\s+(une\s+)?(proposition|devis|offre)/i,
  ]

  // Patterns pour détecter une confirmation
  private static confirmPatterns = [
    /^(oui|yes|ok|d'accord|parfait|exactement|correct|tout à fait)$/i,
    /^(vas-y|go|valide|confirme)$/i,
    /^(c'est (bon|ça|correct|parfait))$/i,
  ]

  // Patterns pour détecter une annulation
  private static cancelPatterns = [
    /^(non|no|annule|stop|arrête)$/i,
    /^(pas (maintenant|ça|aujourd'hui))$/i,
    /^(laisse tomber)$/i,
  ]

  // Patterns pour détecter une modification
  private static modifyPatterns = [
    /^non,?\s+/i,
    /plutôt/i,
    /modifier?/i,
    /changer?/i,
    /corriger?/i,
    /^pas\s+/i,
  ]

  /**
   * Détecter l'intention principale du message
   */
  static detectIntent(message: string, hasPendingAction: boolean = false): IntentDetection {
    const trimmedMessage = message.trim()

    // Si on attend une confirmation
    if (hasPendingAction) {
      if (this.matchesPatterns(trimmedMessage, this.confirmPatterns)) {
        return {
          intent: 'confirm',
          confidence: 0.95,
          entities: {}
        }
      }

      if (this.matchesPatterns(trimmedMessage, this.cancelPatterns)) {
        return {
          intent: 'cancel',
          confidence: 0.95,
          entities: {}
        }
      }

      if (this.matchesPatterns(trimmedMessage, this.modifyPatterns)) {
        return {
          intent: 'modify',
          confidence: 0.85,
          entities: this.extractModifications(trimmedMessage)
        }
      }
    }

    // Détecter création d'opportunité
    if (this.matchesPatterns(message, this.dealPatterns)) {
      return {
        intent: 'create_deal',
        confidence: 0.9,
        entities: this.extractDealEntities(message)
      }
    }

    // Détecter création d'action
    if (this.matchesPatterns(message, this.actionPatterns)) {
      return {
        intent: 'create_action',
        confidence: 0.9,
        entities: this.extractActionEntities(message)
      }
    }

    // Par défaut, c'est une requête
    return {
      intent: 'query',
      confidence: 0.5,
      entities: {}
    }
  }

  /**
   * Vérifier si le message correspond à un des patterns
   */
  private static matchesPatterns(message: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(message))
  }

  /**
   * Extraire les entités pour une opportunité
   */
  private static extractDealEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extraire le nom du client
    const clientPatterns = [
      /(?:avec|pour|client|entreprise|société)\s+([A-Z][a-zA-Z\s&-]+?)(?:\s+(?:pour|de|à)|$)/,
      /([A-Z][a-zA-Z\s&-]+?)\s+(?:veut|souhaite|intéressé)/,
    ]

    for (const pattern of clientPatterns) {
      const match = message.match(pattern)
      if (match) {
        entities.client = match[1].trim()
        break
      }
    }

    // Extraire le montant
    const amountPatterns = [
      /(\d+[\s\u00A0]?\d*)\s*(?:k|mille)/i,
      /(\d+[\s\u00A0]?\d*)\s*(?:€|euros?)/i,
      /(?:montant|budget|valeur).*?(\d+[\s\u00A0]?\d*)/i,
    ]

    for (const pattern of amountPatterns) {
      const match = message.match(pattern)
      if (match) {
        let amount = parseInt(match[1].replace(/[\s\u00A0]/g, ''))

        // Si c'est en milliers (k)
        if (message.toLowerCase().includes('k') || message.toLowerCase().includes('mille')) {
          amount *= 1000
        }

        entities.amount = amount
        break
      }
    }

    // Extraire le statut
    if (/prospect/i.test(message)) {
      entities.status = 'prospect'
    } else if (/n[ée]gociation/i.test(message)) {
      entities.status = 'negotiation'
    } else if (/proposition/i.test(message)) {
      entities.status = 'proposal'
    }

    // Extraire la probabilité
    const probabilityMatch = message.match(/(\d+)\s*%/)
    if (probabilityMatch) {
      entities.probability = parseInt(probabilityMatch[1])
    }

    return entities
  }

  /**
   * Extraire les entités pour une action
   */
  private static extractActionEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Extraire le type d'action
    if (/rappeler|appeler|contacter|téléphoner/i.test(message)) {
      entities.type = 'call'
    } else if (/mail|email|message|écrire/i.test(message)) {
      entities.type = 'email'
    } else if (/rendez-vous|meeting|r[ée]union/i.test(message)) {
      entities.type = 'meeting'
    } else if (/pr[ée]parer|rédiger|proposition|devis/i.test(message)) {
      entities.type = 'task'
    }

    // Extraire le contact
    const contactPatterns = [
      /(?:rappeler|appeler|contacter)\s+([A-Z][a-zA-Z\s-]+?)(?:\s+(?:pour|demain|aujourd'hui|ce|cette|à)|$)/,
      /(?:avec|chez)\s+([A-Z][a-zA-Z\s-]+?)(?:\s+(?:pour|demain|aujourd'hui)|$)/,
    ]

    for (const pattern of contactPatterns) {
      const match = message.match(pattern)
      if (match) {
        entities.contact = match[1].trim()
        break
      }
    }

    // Extraire la date
    const today = new Date()
    if (/aujourd'hui/i.test(message)) {
      entities.dueDate = today.toISOString().split('T')[0]
    } else if (/demain/i.test(message)) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      entities.dueDate = tomorrow.toISOString().split('T')[0]
    } else if (/lundi/i.test(message)) {
      entities.dueDate = this.getNextWeekday(1)
    } else if (/mardi/i.test(message)) {
      entities.dueDate = this.getNextWeekday(2)
    } else if (/mercredi/i.test(message)) {
      entities.dueDate = this.getNextWeekday(3)
    } else if (/jeudi/i.test(message)) {
      entities.dueDate = this.getNextWeekday(4)
    } else if (/vendredi/i.test(message)) {
      entities.dueDate = this.getNextWeekday(5)
    }

    // Extraire l'heure
    const timeMatch = message.match(/(\d+)\s*(?:h|:)\s*(\d+)?/)
    if (timeMatch) {
      const hour = timeMatch[1]
      const minute = timeMatch[2] || '00'
      entities.time = `${hour}:${minute}`
    }

    // Extraire la priorité
    if (/urgent|prioritaire|important|haute/i.test(message)) {
      entities.priority = 'high'
    } else if (/basse|faible|peut attendre/i.test(message)) {
      entities.priority = 'low'
    } else {
      entities.priority = 'medium'
    }

    return entities
  }

  /**
   * Extraire les modifications d'une réponse
   */
  private static extractModifications(message: string): Record<string, any> {
    const entities: Record<string, any> = {}

    // Chercher un nouveau montant
    const amountMatch = message.match(/(\d+[\s\u00A0]?\d*)\s*(?:k|mille|€|euros?)/i)
    if (amountMatch) {
      let amount = parseInt(amountMatch[1].replace(/[\s\u00A0]/g, ''))
      if (message.toLowerCase().includes('k') || message.toLowerCase().includes('mille')) {
        amount *= 1000
      }
      entities.amount = amount
    }

    // Chercher une nouvelle heure
    const timeMatch = message.match(/(\d+)\s*(?:h|:)\s*(\d+)?/)
    if (timeMatch) {
      const hour = timeMatch[1]
      const minute = timeMatch[2] || '00'
      entities.time = `${hour}:${minute}`
    }

    // Chercher une nouvelle date
    if (/demain/i.test(message)) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      entities.dueDate = tomorrow.toISOString().split('T')[0]
    }

    // Chercher un nouveau pourcentage
    const percentMatch = message.match(/(\d+)\s*%/)
    if (percentMatch) {
      entities.probability = parseInt(percentMatch[1])
    }

    return entities
  }

  /**
   * Obtenir la date du prochain jour de la semaine
   */
  private static getNextWeekday(targetDay: number): string {
    const today = new Date()
    const currentDay = today.getDay() // 0 = dimanche, 1 = lundi, ...

    let daysToAdd = targetDay - currentDay
    if (daysToAdd <= 0) {
      daysToAdd += 7
    }

    const result = new Date(today)
    result.setDate(result.getDate() + daysToAdd)

    return result.toISOString().split('T')[0]
  }
}
