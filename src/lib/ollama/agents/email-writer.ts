/**
 * Agent Email Writer - Rédaction d'emails commerciaux
 */

import { createOllamaClient, ollamaConfig } from '../client'
import { SYSTEM_PROMPTS, formatPrompt } from '../prompts/system-prompts'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

interface ContactContext {
  firstName?: string
  lastName?: string
  position?: string
  companyName?: string
  previousInteractions?: string[]
}

export type EmailPurpose =
  | 'prospection' // Premier contact
  | 'relance' // Relance après non-réponse
  | 'follow_up' // Suivi après RDV/appel
  | 'proposal' // Envoi de proposition
  | 'closing' // Finalisation
  | 'custom' // Personnalisé

export interface EmailResult {
  subject: string
  body: string
  tone: string
}

export class EmailWriterAgent {
  private llm = createOllamaClient(ollamaConfig.models.writer, {
    temperature: 0.8, // Plus créatif pour la rédaction
  })

  /**
   * Génère un email commercial
   */
  async writeEmail(
    purpose: EmailPurpose,
    context: ContactContext,
    additionalInstructions?: string
  ): Promise<EmailResult> {
    try {
      const contactInfo = this.formatContactContext(context)
      const purposeDescription = this.getPurposeDescription(purpose)

      const systemPrompt = formatPrompt(SYSTEM_PROMPTS.emailWriter, {
        contact_context: contactInfo,
        email_purpose: purposeDescription,
      })

      const userMessage = additionalInstructions
        ? `Rédige un email de ${purpose}. Instructions supplémentaires : ${additionalInstructions}`
        : `Rédige un email de ${purpose}.`

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ]

      const response = await this.llm.invoke(messages)
      const content = response.content.toString()

      return this.parseEmailResponse(content)

    } catch (error) {
      console.error('[EmailWriter] Erreur de génération:', error)
      throw new Error('Impossible de générer l\'email')
    }
  }

  /**
   * Améliore un email existant
   */
  async improveEmail(
    originalEmail: string,
    improvements: string
  ): Promise<EmailResult> {
    try {
      const systemPrompt = SYSTEM_PROMPTS.emailWriter.replace(
        '{contact_context}',
        'Non spécifié'
      ).replace('{email_purpose}', 'Amélioration d\'un email existant')

      const userMessage = `
EMAIL ORIGINAL :
${originalEmail}

AMÉLIORATIONS DEMANDÉES :
${improvements}

Rééc ris l'email en appliquant ces améliorations.
      `.trim()

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(userMessage),
      ]

      const response = await this.llm.invoke(messages)
      const content = response.content.toString()

      return this.parseEmailResponse(content)

    } catch (error) {
      console.error('[EmailWriter] Erreur d\'amélioration:', error)
      throw new Error('Impossible d\'améliorer l\'email')
    }
  }

  /**
   * Formate le contexte du contact
   */
  private formatContactContext(context: ContactContext): string {
    const parts: string[] = []

    if (context.firstName || context.lastName) {
      const name = [context.firstName, context.lastName]
        .filter(Boolean)
        .join(' ')
      parts.push(`Contact : ${name}`)
    }

    if (context.position) {
      parts.push(`Poste : ${context.position}`)
    }

    if (context.companyName) {
      parts.push(`Entreprise : ${context.companyName}`)
    }

    if (context.previousInteractions && context.previousInteractions.length > 0) {
      parts.push(
        `Interactions précédentes : ${context.previousInteractions.join(', ')}`
      )
    }

    return parts.length > 0 ? parts.join('\n') : 'Aucune information disponible'
  }

  /**
   * Retourne la description du type d'email
   */
  private getPurposeDescription(purpose: EmailPurpose): string {
    const descriptions: Record<EmailPurpose, string> = {
      prospection: 'Premier contact pour présenter votre solution et obtenir un RDV',
      relance: 'Relance après un email sans réponse (rappel bienveillant)',
      follow_up: 'Suivi après un rendez-vous ou appel téléphonique',
      proposal: 'Envoi d\'une proposition commerciale ou devis',
      closing: 'Email de finalisation pour conclure la vente',
      custom: 'Email personnalisé selon le contexte',
    }

    return descriptions[purpose]
  }

  /**
   * Parse la réponse du LLM pour extraire objet et corps
   */
  private parseEmailResponse(content: string): EmailResult {
    // Recherche de l'objet
    const subjectMatch = content.match(/(?:Objet|Subject)\s*:?\s*(.+?)(?:\n|$)/i)
    const subject = subjectMatch
      ? subjectMatch[1].trim()
      : 'À personnaliser'

    // Extraction du corps (tout après l'objet)
    let body = content
    if (subjectMatch) {
      body = content.substring(subjectMatch.index! + subjectMatch[0].length).trim()
    }

    // Nettoyage des artefacts markdown
    body = body
      .replace(/^#+\s*/gm, '') // Enlève les titres markdown
      .replace(/\*\*(.+?)\*\*/g, '$1') // Enlève le gras
      .trim()

    // Détection du tone (formel/informel)
    const tone = content.toLowerCase().includes('tu ')
      ? 'informel'
      : 'formel'

    return {
      subject,
      body,
      tone,
    }
  }
}
