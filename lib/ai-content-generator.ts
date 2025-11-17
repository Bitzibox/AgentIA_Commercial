import { Deal, BusinessContext } from "@/types"
import { geminiClientService } from "@/lib/gemini-client"

export class AIContentGenerator {
  // Générer un email de relance personnalisé avec Gemini
  static async generateFollowUpEmail(deal: Deal): Promise<string> {
    const daysSinceContact = Math.floor(
      (new Date().getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    const prompt = `Tu es un expert en vente B2B. Génère un email de relance professionnel et personnalisé.

CONTEXTE DU DEAL:
- Entreprise: ${deal.company}
- Contact: ${deal.contact}
- Valeur: ${deal.value.toLocaleString('fr-FR')} €
- Phase actuelle: ${deal.stage}
- Probabilité: ${deal.probability}%
- Dernière activité: Il y a ${daysSinceContact} jours
${deal.nextStep ? `- Prochaine étape prévue: ${deal.nextStep}` : ''}
${deal.tags ? `- Tags: ${deal.tags.join(', ')}` : ''}

INSTRUCTIONS:
1. Rédige un email de relance court et percutant (150-200 mots)
2. Objet accrocheur et personnalisé
3. Rappelle subtilement le contexte sans être insistant
4. Apporte de la valeur (insight, étude de cas, invitation à un événement, etc.)
5. CTA clair (proposition de RDV avec 2 créneaux précis)
6. Ton professionnel mais chaleureux
7. Adapte le contenu à la phase du deal (${deal.stage})

FORMAT ATTENDU:
Objet: [objet accrocheur]

[Corps de l'email]

Bien cordialement,
[Signature]

---
💡 Conseil personnalisé: [1-2 lignes de conseil stratégique pour maximiser les chances de réponse]`

    try {
      return await geminiClientService.generateContent(prompt)
    } catch (error) {
      console.error("Erreur génération email:", error)
      return `**Erreur de génération**\n\nImpossible de générer l'email pour le moment. Veuillez vérifier votre clé API Gemini et réessayer.`
    }
  }

  // Générer une proposition commerciale structurée avec Gemini
  static async generateProposal(deal: Deal, context: BusinessContext): Promise<string> {
    const similarDeals = context.topDeals
      .filter(d => d.stage === "Gagné" && Math.abs(d.value - deal.value) / deal.value < 0.3)
      .slice(0, 2)

    const prompt = `Tu es un expert en proposition commerciale B2B. Génère une proposition commerciale complète et professionnelle en markdown.

CONTEXTE DU DEAL:
- Entreprise: ${deal.company}
- Contact: ${deal.contact}
- Valeur estimée: ${deal.value.toLocaleString('fr-FR')} €
- Phase: ${deal.stage}
- Probabilité: ${deal.probability}%
${deal.nextStep ? `- Prochaine étape: ${deal.nextStep}` : ''}

CONTEXTE BUSINESS:
- Pipeline total: ${context.topDeals.length} deals
- Taux de conversion moyen: ${context.metrics.conversionRate}%
${similarDeals.length > 0 ? `- Deals similaires gagnés: ${similarDeals.map(d => `${d.company} (${d.value.toLocaleString('fr-FR')} €)`).join(', ')}` : ''}

INSTRUCTIONS:
Génère une proposition commerciale structurée avec les sections suivantes:

1. **RÉSUMÉ EXÉCUTIF** (2-3 lignes percutantes)
2. **CONTEXTE & ENJEUX** (problématiques identifiées)
3. **SOLUTION PROPOSÉE** (bénéfices concrets, valeur ajoutée)
4. **PÉRIMÈTRE DE LA PRESTATION** (3 phases détaillées avec timeline)
5. **INVESTISSEMENT** (tableau avec répartition: 40% licence/setup, 35% déploiement, 25% formation/support)
6. **ROI ESTIMÉ** (retour sur investissement attendu avec métriques)
7. **PLANNING PRÉVISIONNEL** (jalons clés)
8. **PROCHAINES ÉTAPES** (4-5 actions concrètes)

${similarDeals.length > 0 ? `Mentionne les succès de ${similarDeals.map(d => d.company).join(' et ')} comme références.` : ''}

IMPORTANT:
- Utilise du markdown pour la mise en forme
- Sois concret et orienté résultats
- Utilise des tableaux, listes et émojis
- Adapte le ton selon la taille du deal
- Inclus un conseil stratégique en fin de document`

    try {
      return await geminiClientService.generateContent(prompt)
    } catch (error) {
      console.error("Erreur génération proposition:", error)
      return `**Erreur de génération**\n\nImpossible de générer la proposition pour le moment. Veuillez vérifier votre clé API Gemini et réessayer.`
    }
  }

  // Générer un briefing pour un RDV avec Gemini
  static async generateMeetingBriefing(deal: Deal, context: BusinessContext): Promise<string> {
    const relatedActions = context.actionItems.filter(
      a => a.relatedTo?.type === "deal" && a.relatedTo.id === deal.id
    )

    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    const prompt = `Tu es un expert en stratégie commerciale. Génère un briefing complet pour préparer un RDV commercial.

CONTEXTE DU DEAL:
- Entreprise: ${deal.company}
- Contact: ${deal.contact}
- Valeur: ${deal.value.toLocaleString('fr-FR')} €
- Probabilité: ${deal.probability}%
- Phase: ${deal.stage}
- Dernière activité: Il y a ${daysSinceLastActivity} jours
${deal.nextStep ? `- Prochaine étape: ${deal.nextStep}` : ''}
${deal.tags ? `- Tags: ${deal.tags.join(', ')}` : ''}

ACTIONS ASSOCIÉES:
${relatedActions.length > 0 ? relatedActions.map(a => `- ${a.title} ${a.completed ? '✅' : '⏳'}`).join('\n') : '- Première interaction'}

CONTEXTE BUSINESS:
- Taux de conversion: ${context.metrics.conversionRate}%
- Cycle de vente moyen: ${context.metrics.salesCycle} jours

INSTRUCTIONS:
Génère un briefing de RDV structuré avec:

1. **INFORMATIONS CLÉS** (recap du deal)
2. **CONTEXTE** (historique et situation actuelle)
3. **OBJECTIFS DU RDV** (4-5 objectifs SMART adaptés à la phase ${deal.stage})
4. **QUESTIONS CLÉS À POSER** (3 catégories: contexte, projet, décision)
5. **PITCH ELEVATOR** (30 secondes max, percutant)
6. **POINTS DE VIGILANCE** (alertes basées sur proba ${deal.probability}%, délai ${daysSinceLastActivity}j, phase ${deal.stage})
7. **ACTIONS POST-RDV** (5 actions systématiques)
8. **CONSEILS TACTIQUES** (3-4 tips concrets pour maximiser les chances)

IMPORTANT:
- Utilise du markdown avec émojis
- Sois actionnable et concret
- Adapte les objectifs à la phase du deal
- Identifie les red flags potentiels
- Propose une stratégie de closing si deal mature`

    try {
      return await geminiClientService.generateContent(prompt)
    } catch (error) {
      console.error("Erreur génération briefing:", error)
      return `**Erreur de génération**\n\nImpossible de générer le briefing pour le moment. Veuillez vérifier votre clé API Gemini et réessayer.`
    }
  }

  // Générer un script d'appel avec Gemini
  static async generateCallScript(contact: string, company: string, context?: string): Promise<string> {
    const prompt = `Tu es un expert en prospection téléphonique B2B. Génère un script d'appel professionnel et efficace.

CONTEXTE:
- Contact: ${contact}
- Entreprise: ${company}
${context ? `- Contexte additionnel: ${context}` : ''}

INSTRUCTIONS:
Génère un script d'appel structuré avec:

1. **OBJECTIF** (clair et mesurable)
2. **INTRODUCTION** (15 sec, accroche personnalisée pour ${company})
3. **PITCH** (30 sec, valeur ajoutée claire)
4. **QUESTIONS DE QUALIFICATION** (5-7 questions ouvertes pour identifier les pain points)
5. **PRISE DE RDV** (closing avec choix limité de créneaux)
6. **GESTION DES OBJECTIONS** (5 objections classiques + réponses)
   - "Je n'ai pas le temps"
   - "Envoyez-moi de la documentation"
   - "Nous avons déjà une solution"
   - "Ce n'est pas le bon moment"
   - "Envoyez un email"
7. **CONCLUSION** (3 scenarios: RDV obtenu, intéressé mais pas de RDV, refus net)
8. **POST-APPEL** (checklist de ce qu'il faut noter dans le CRM)

IMPORTANT:
- Ton conversationnel, pas robotique
- Personnalise pour ${company} en intégrant ${contact}
- Utilise markdown avec émojis
- Inclus des tips tactiques (langage corporel, intonation)
- Évite le jargon commercial lourd
- Focus sur la valeur, pas sur la vente`

    try {
      return await geminiClientService.generateContent(prompt)
    } catch (error) {
      console.error("Erreur génération script:", error)
      return `**Erreur de génération**\n\nImpossible de générer le script d'appel pour le moment. Veuillez vérifier votre clé API Gemini et réessayer.`
    }
  }

  // Générer un résumé de journée avec Gemini
  static async generateDailySummary(context: BusinessContext): Promise<string> {
    const todayActions = context.actionItems.filter(a => {
      if (!a.dueDate) return false
      const today = new Date()
      const dueDate = new Date(a.dueDate)
      return dueDate.toDateString() === today.toDateString()
    })

    const overdueActions = context.actionItems.filter(a => {
      if (!a.dueDate || a.completed) return false
      return new Date(a.dueDate) < new Date()
    })

    const hotDeals = context.topDeals.filter(d =>
      (d.stage === "Négociation" || d.stage === "Closing") && d.probability >= 60
    )

    const prompt = `Tu es un assistant commercial IA. Génère un résumé quotidien motivant et actionnable.

CONTEXTE BUSINESS:
- CA actuel: ${context.metrics.revenue.toLocaleString('fr-FR')} € (${context.metrics.revenueGrowth > 0 ? '+' : ''}${context.metrics.revenueGrowth}%)
- Leads: ${context.metrics.leads} (${context.metrics.leadsGrowth > 0 ? '+' : ''}${context.metrics.leadsGrowth}%)
- Taux de conversion: ${context.metrics.conversionRate}%
- Pipeline: ${context.metrics.pipelineValue.toLocaleString('fr-FR')} €
- Deals actifs: ${context.topDeals.filter(d => d.stage !== "Gagné" && d.stage !== "Perdu").length}

ACTIONS AUJOURD'HUI:
${todayActions.length > 0 ? todayActions.map(a => `- ${a.title} (${a.priority}) ${a.relatedTo ? `[${a.relatedTo.name}]` : ''}`).join('\n') : 'Aucune action planifiée'}

ACTIONS EN RETARD:
${overdueActions.length > 0 ? overdueActions.map(a => `- ${a.title} (retard: ${Math.floor((new Date().getTime() - new Date(a.dueDate!).getTime()) / (1000 * 60 * 60 * 24))}j)`).join('\n') : 'Aucune action en retard'}

DEALS PRIORITAIRES:
${hotDeals.length > 0 ? hotDeals.map(d => `- ${d.company}: ${d.value.toLocaleString('fr-FR')} € (${d.stage}, ${d.probability}%)`).join('\n') : 'Aucun deal en phase critique'}

LEADS CHAUDS:
${context.hotLeads.slice(0, 3).map(l => `- ${l.company} (score: ${l.score})`).join('\n')}

INSTRUCTIONS:
Génère un résumé de journée structuré avec:

1. **RÉSUMÉ EXPRESS** (2-3 lignes motivantes sur la journée)
2. **ACTIONS POUR AUJOURD'HUI** (liste priorisée avec temps estimé)
3. **ALERTES** (actions en retard à traiter en urgence si présentes)
4. **DEALS PRIORITAIRES** (focus sur les deals chauds)
5. **OPPORTUNITÉS DU JOUR** (leads chauds à contacter)
6. **OBJECTIFS DU JOUR** (3-4 objectifs SMART)
7. **CONSEIL STRATÉGIQUE** (1 conseil actionnable basé sur les métriques)

IMPORTANT:
- Ton motivant et énergique
- Utilise markdown avec émojis
- Priorise par impact business
- Donne des time estimates
- Identifie la "priorité absolue" du jour
- Termine par une note positive et motivante

Génère un résumé qui donne envie d'attaquer la journée ! 💪`

    try {
      return await geminiClientService.generateContent(prompt)
    } catch (error) {
      console.error("Erreur génération résumé:", error)
      return `**Erreur de génération**\n\nImpossible de générer le résumé pour le moment. Veuillez vérifier votre clé API Gemini et réessayer.`
    }
  }
}
