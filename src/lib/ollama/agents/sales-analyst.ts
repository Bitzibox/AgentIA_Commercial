/**
 * Agent Sales Analyst - Analyse des données commerciales
 */

import { createOllamaClient, ollamaConfig } from '../client'
import { SYSTEM_PROMPTS, formatPrompt } from '../prompts/system-prompts'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

interface PipelineData {
  totalDeals: number
  totalValue: number
  averageValue: number
  conversionRate: number
  topDeals: Array<{
    title: string
    value: number
    stage: string
    probability: number
  }>
  dealsByStage: Record<string, number>
}

interface CompanyContext {
  name: string
  industry?: string
  monthlyTarget?: number
}

export class SalesAnalystAgent {
  private llm = createOllamaClient(ollamaConfig.models.analyst, {
    temperature: 0.3, // Assez déterministe pour l'analyse
  })

  /**
   * Analyse le pipeline et répond à la question
   */
  async analyze(
    question: string,
    pipelineData: PipelineData,
    companyContext: CompanyContext
  ): Promise<string> {
    try {
      // Formatte les données pour le LLM
      const dataContext = this.formatPipelineData(pipelineData)
      const companyInfo = this.formatCompanyContext(companyContext)

      // Construit le prompt système
      const systemPrompt = formatPrompt(SYSTEM_PROMPTS.salesAnalyst, {
        company_context: companyInfo,
        data_context: dataContext,
      })

      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(question),
      ]

      const response = await this.llm.invoke(messages)
      return response.content.toString()

    } catch (error) {
      console.error('[SalesAnalyst] Erreur d\'analyse:', error)
      throw new Error('Impossible d\'analyser les données')
    }
  }

  /**
   * Génère un rapport automatique du pipeline
   */
  async generatePipelineReport(
    pipelineData: PipelineData,
    companyContext: CompanyContext
  ): Promise<string> {
    const question = `Génère un rapport d'analyse complet du pipeline commercial actuel avec les points d'attention et recommandations.`
    return this.analyze(question, pipelineData, companyContext)
  }

  /**
   * Formate les données du pipeline pour le LLM
   */
  private formatPipelineData(data: PipelineData): string {
    const dealsList = data.topDeals
      .slice(0, 5)
      .map(
        (d, i) =>
          `${i + 1}. ${d.title} - ${d.value.toLocaleString('fr-FR')}€ (${d.stage}, ${d.probability}% de probabilité)`
      )
      .join('\n')

    const stageBreakdown = Object.entries(data.dealsByStage)
      .map(([stage, count]) => `- ${stage}: ${count} deal(s)`)
      .join('\n')

    return `
MÉTRIQUES GLOBALES :
- Nombre total d'opportunités : ${data.totalDeals}
- Valeur totale du pipeline : ${data.totalValue.toLocaleString('fr-FR')}€
- Valeur moyenne par deal : ${data.averageValue.toLocaleString('fr-FR')}€
- Taux de conversion global : ${data.conversionRate}%

TOP OPPORTUNITÉS :
${dealsList}

RÉPARTITION PAR ÉTAPE :
${stageBreakdown}
    `.trim()
  }

  /**
   * Formate le contexte entreprise
   */
  private formatCompanyContext(context: CompanyContext): string {
    let info = `Entreprise : ${context.name}`

    if (context.industry) {
      info += `\nSecteur : ${context.industry}`
    }

    if (context.monthlyTarget) {
      info += `\nObjectif mensuel : ${context.monthlyTarget.toLocaleString('fr-FR')}€`
    }

    return info
  }
}
