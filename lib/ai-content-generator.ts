import { Deal, Lead, BusinessContext } from "@/types"

export class AIContentGenerator {
  // Générer un email de relance personnalisé
  static generateFollowUpEmail(deal: Deal): string {
    const daysSinceContact = Math.floor(
      (new Date().getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    return `Objet : Suite à notre échange concernant ${deal.company}

Bonjour ${deal.contact},

J'espère que vous allez bien.

Je reviens vers vous concernant notre échange de il y a ${daysSinceContact} jours au sujet de votre projet ${deal.nextStep ? `(${deal.nextStep})` : ""}.

Où en êtes-vous dans votre réflexion ? Avez-vous eu l'occasion de consulter ${deal.stage === "Proposition" ? "notre proposition" : "les informations que je vous ai transmises"} ?

Je reste à votre disposition pour :
${deal.stage === "Qualification" ? "• Répondre à vos questions\n• Organiser une démonstration personnalisée\n• Vous présenter des cas clients similaires" : ""}
${deal.stage === "Proposition" ? "• Discuter des détails de notre proposition\n• Ajuster notre offre à vos besoins spécifiques\n• Planifier les prochaines étapes" : ""}
${deal.stage === "Négociation" ? "• Finaliser les derniers détails\n• Organiser une réunion avec les décideurs\n• Répondre aux éventuelles objections" : ""}

Seriez-vous disponible pour un point téléphonique cette semaine ?

Bien cordialement,
[Votre nom]

---
💡 Conseil IA : Personnalisez cet email en ajoutant :
- Une référence à votre dernière conversation
- Un élément d'actualité de leur secteur
- Une valeur ajoutée concrète (étude de cas, ROI estimé, etc.)
`
  }

  // Générer une proposition commerciale structurée
  static generateProposal(deal: Deal, context: BusinessContext): string {
    const similarDeals = context.topDeals
      .filter(d => d.stage === "Gagné" && Math.abs(d.value - deal.value) / deal.value < 0.3)
      .slice(0, 2)

    return `# PROPOSITION COMMERCIALE
## ${deal.company}

---

### 📋 CONTEXTE & ENJEUX

**Client :** ${deal.company}
**Contact :** ${deal.contact}
**Montant estimé :** ${deal.value.toLocaleString('fr-FR')} €
**Probabilité de succès :** ${deal.probability}%

#### Enjeux identifiés :
1. [Enjeu principal à définir selon vos échanges]
2. [Défi business à résoudre]
3. [Objectif de croissance/optimisation]

---

### 🎯 SOLUTION PROPOSÉE

#### Notre approche :
Notre solution vous permettra de :
- ✅ [Bénéfice clé n°1 - gain de temps, efficacité...]
- ✅ [Bénéfice clé n°2 - réduction des coûts...]
- ✅ [Bénéfice clé n°3 - amélioration de la performance...]

#### Périmètre de la prestation :
1. **Phase 1 - Cadrage** (2 semaines)
   - Audit de l'existant
   - Définition des besoins
   - Conception de la solution

2. **Phase 2 - Déploiement** (4-6 semaines)
   - Mise en place technique
   - Formation des équipes
   - Tests et ajustements

3. **Phase 3 - Accompagnement** (3 mois)
   - Support technique
   - Optimisation continue
   - Reporting mensuel

---

### 💰 INVESTISSEMENT

| Prestation | Montant |
|-----------|---------|
| Licence / Setup | ${Math.round(deal.value * 0.4).toLocaleString('fr-FR')} € |
| Déploiement | ${Math.round(deal.value * 0.35).toLocaleString('fr-FR')} € |
| Formation & Support | ${Math.round(deal.value * 0.25).toLocaleString('fr-FR')} € |
| **TOTAL** | **${deal.value.toLocaleString('fr-FR')} €** |

*Paiement en 3 fois possible*

---

### 📈 ROI ESTIMÉ

**Retour sur investissement attendu : 6-12 mois**

Gains estimés :
- Gain de productivité : +30%
- Réduction des coûts : 15-20%
- Amélioration de la satisfaction client : +25%

${similarDeals.length > 0 ? `
---

### 🏆 RÉFÉRENCES CLIENTS

Nos clients similaires :
${similarDeals.map(d => `- **${d.company}** : Deal de ${d.value.toLocaleString('fr-FR')} € - Résultats très positifs`).join('\n')}
` : ''}

---

### 🗓️ PLANNING PRÉVISIONNEL

- **J+7** : Validation de la proposition
- **J+14** : Signature du contrat
- **J+21** : Démarrage du projet
- **J+60** : Mise en production

---

### 📞 PROCHAINES ÉTAPES

1. Validation de cette proposition de votre côté
2. Rendez-vous de cadrage avec vos équipes
3. Ajustements éventuels
4. Contractualisation

---

💡 **Conseil IA** : Personnalisez cette proposition en :
- Ajoutant des métriques spécifiques à leur secteur
- Incluant 2-3 cas clients concrets
- Proposant une démo ou un POC gratuit
- Limitant la validité de l'offre (créer l'urgence)
`
  }

  // Générer un briefing pour un RDV
  static generateMeetingBriefing(deal: Deal, context: BusinessContext): string {
    const relatedActions = context.actionItems.filter(
      a => a.relatedTo?.type === "deal" && a.relatedTo.id === deal.id
    )

    const daysSinceLastActivity = Math.floor(
      (new Date().getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    return `# 📋 BRIEFING RDV - ${deal.company}

## 🎯 INFORMATIONS CLÉS

**Entreprise :** ${deal.company}
**Contact :** ${deal.contact}
**Valeur du deal :** ${deal.value.toLocaleString('fr-FR')} €
**Probabilité :** ${deal.probability}%
**Phase actuelle :** ${deal.stage}
**Dernière activité :** Il y a ${daysSinceLastActivity} jour${daysSinceLastActivity > 1 ? 's' : ''}

---

## 📊 CONTEXTE

${deal.nextStep ? `**Prochaine étape prévue :** ${deal.nextStep}\n` : ''}
${deal.tags && deal.tags.length > 0 ? `**Tags :** ${deal.tags.join(', ')}\n` : ''}

### Historique récent :
${relatedActions.length > 0 ? relatedActions.slice(0, 3).map(a => `- ${a.title} ${a.completed ? '✅' : '⏳'}`).join('\n') : '- Première interaction'}

---

## 💡 OBJECTIFS DE CE RDV

${deal.stage === "Prospection" ? `
1. ✅ Comprendre leurs enjeux business actuels
2. ✅ Identifier les décideurs et le processus d'achat
3. ✅ Qualifier le budget et le timing
4. ✅ Susciter l'intérêt pour une démo/présentation
` : ''}
${deal.stage === "Qualification" ? `
1. ✅ Valider les besoins identifiés
2. ✅ Présenter notre solution en détail
3. ✅ Discuter du budget et du ROI
4. ✅ Obtenir un engagement pour la prochaine étape
` : ''}
${deal.stage === "Proposition" ? `
1. ✅ Présenter notre proposition détaillée
2. ✅ Répondre aux questions et objections
3. ✅ Ajuster l'offre si nécessaire
4. ✅ Négocier les conditions
` : ''}
${deal.stage === "Négociation" ? `
1. ✅ Finaliser les derniers points de négociation
2. ✅ Lever les objections restantes
3. ✅ Présenter les garanties et conditions
4. ✅ Obtenir un accord de principe
` : ''}
${deal.stage === "Closing" ? `
1. ✅ Finaliser la contractualisation
2. ✅ Valider le planning de démarrage
3. ✅ Organiser le kick-off projet
4. ✅ Signer le contrat
` : ''}

---

## ❓ QUESTIONS CLÉS À POSER

### Sur le contexte :
- Quels sont vos principaux défis actuels dans [domaine] ?
- Comment gérez-vous [processus spécifique] aujourd'hui ?
- Qu'est-ce qui vous a motivé à chercher une nouvelle solution ?

### Sur le projet :
- Quel est votre timing idéal pour la mise en place ?
- Qui sont les autres parties prenantes dans cette décision ?
- Quel budget avez-vous alloué à ce projet ?

### Sur la décision :
- Quels critères sont les plus importants pour votre choix ?
- Évaluez-vous d'autres solutions en parallèle ?
- Quelles sont les prochaines étapes de votre processus d'achat ?

---

## 🎤 PITCH ELEVATOR (30 secondes)

"Nous aidons ${deal.company} à [bénéfice principal].
Contrairement aux solutions classiques, notre approche permet de [différenciation].
Nos clients comme [référence] ont obtenu [résultat concret] en [délai]."

---

## 🚨 POINTS DE VIGILANCE

${deal.probability < 50 ? '⚠️ **Probabilité faible** - Identifier les blocages et qualifier sérieusement l\'opportunité\n' : ''}
${daysSinceLastActivity > 14 ? '⚠️ **Deal froid** - Re-créer l\'engagement et valider l\'intérêt\n' : ''}
${deal.stage === "Négociation" ? '⚠️ **Phase sensible** - Rester ferme sur la valeur, flexible sur les modalités\n' : ''}

---

## 📝 ACTIONS POST-RDV

1. ✍️ Envoyer un compte-rendu dans les 2h
2. 📧 Transmettre les documents promis
3. 📅 Planifier la prochaine étape
4. 🔄 Mettre à jour le CRM avec les infos collectées

---

💡 **Conseil IA** : Pendant le RDV :
- Écoutez 70% du temps, parlez 30%
- Prenez des notes sur les mots-clés utilisés
- Posez des questions ouvertes
- Identifiez les objections cachées
- Obtenez un engagement concret sur la suite
`
  }

  // Générer un script d'appel
  static generateCallScript(contact: string, company: string, context?: string): string {
    return `# 📞 SCRIPT D'APPEL - ${company}

## 🎯 OBJECTIF
Obtenir un RDV de 30 minutes pour présenter notre solution

---

## 👋 INTRODUCTION (15 secondes)

"Bonjour ${contact}, [Votre Prénom] de [Votre Entreprise].

Je vous contacte car nous accompagnons des entreprises comme ${company} dans [domaine d'activité].

${context ? `Suite à ${context}, j'ai pensé que notre approche pourrait vous intéresser.` : `J'ai remarqué que [insight sur leur entreprise].`}

Avez-vous 2 minutes ?"

---

## 🎤 PITCH (30 secondes)

**Si OUI :**
"Parfait. En bref, nous aidons les [type d'entreprise] à [bénéfice principal] grâce à [votre solution].

Nos clients comme [référence] ont réussi à [résultat concret] en [délai].

Ce qui les a convaincus ? [argument différenciant]."

**Transition :**
"Pour voir si cela pourrait vous correspondre, j'aurais quelques questions..."

---

## ❓ QUESTIONS DE QUALIFICATION (2 minutes)

1. "Comment gérez-vous [processus X] actuellement ?"
   → Écouter et identifier les pain points

2. "Quels sont vos principaux défis dans ce domaine ?"
   → Creuser les problématiques

3. "Si vous pouviez améliorer un aspect, ce serait quoi ?"
   → Identifier le besoin prioritaire

---

## 📅 PRISE DE RDV (30 secondes)

"D'accord, je comprends mieux votre situation.

Ce serait intéressant d'approfondir lors d'un échange plus complet.
Je pourrais vous montrer concrètement comment nous avons aidé [entreprise similaire].

**Êtes-vous disponible mardi ou jeudi de la semaine prochaine ?**"

**Alternative si réticence :**
"Que diriez-vous d'un échange rapide de 15 minutes en visio ?
Sans engagement, juste pour voir si ça peut avoir du sens pour vous."

---

## 🚫 GESTION DES OBJECTIONS

### "Je n'ai pas le temps"
→ "Je comprends. Justement, notre solution permet de gagner [X heures/semaine].
   Un échange de 15 minutes pourrait vous faire économiser beaucoup de temps à long terme."

### "Envoyez-moi de la documentation"
→ "Avec plaisir ! Pour vous envoyer les informations les plus pertinentes,
   j'ai juste 2-3 questions rapides... [requalifier]"

### "Nous avons déjà une solution"
→ "Super ! Curieux de savoir : qu'est-ce qui fonctionne bien ?
   Et s'il y avait un point à améliorer, ce serait lequel ?"

### "Ce n'est pas le bon moment"
→ "Je comprends. À quel moment pensez-vous que ce serait plus opportun ?
   [Obtenir une date précise]"

### "Envoyez un email"
→ "Aucun problème. Pour que mon email soit pertinent, puis-je vous poser
   une question rapide sur [pain point identifié] ?"

---

## ✅ CONCLUSION

**Si RDV obtenu :**
"Parfait ! Je vous envoie une invitation pour [date/heure].
À très bientôt ${contact} !"

**Si pas de RDV mais intéressé :**
"Je vous envoie un email avec plus d'infos.
Puis-je vous rappeler dans [délai] pour avoir votre feedback ?"

**Si refus net :**
"Je comprends. Puis-je vous rappeler dans [3-6 mois] ?
Les choses évoluent vite !"

---

## 📝 POST-APPEL (Immédiat)

✍️ Noter dans le CRM :
- Niveau d'intérêt (1-5)
- Pain points identifiés
- Objections rencontrées
- Prochaine action
- Meilleur moment pour rappeler

---

💡 **Conseils IA** :
- ✅ Souriez en parlant (ça s'entend)
- ✅ Restez debout pendant l'appel (plus d'énergie)
- ✅ Prenez des notes en écoutant
- ✅ Utilisez le prénom de la personne
- ✅ Parlez lentement et clairement
- ❌ N'interrompez jamais
- ❌ Ne lisez pas votre script mot pour mot
- ❌ N'insistez pas si c'est vraiment un refus
`
  }

  // Générer un résumé de journée
  static generateDailySummary(context: BusinessContext): string {
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

    return `# 📊 RÉSUMÉ DE VOTRE JOURNÉE

---

## ⏰ ACTIONS POUR AUJOURD'HUI (${todayActions.length})

${todayActions.length > 0 ? todayActions.map((a, i) => `
${i + 1}. **${a.title}**
   ${a.description}
   ${a.relatedTo ? `   📎 ${a.relatedTo.name}` : ''}
`).join('\n') : '✅ Aucune action planifiée pour aujourd\'hui'}

---

${overdueActions.length > 0 ? `## 🚨 ACTIONS EN RETARD (${overdueActions.length})

${overdueActions.map((a, i) => `
${i + 1}. **${a.title}**
   ⏰ Échéance dépassée depuis ${Math.floor((new Date().getTime() - new Date(a.dueDate!).getTime()) / (1000 * 60 * 60 * 24))} jour(s)
`).join('\n')}

---
` : ''}

## 🔥 DEALS PRIORITAIRES

${hotDeals.length > 0 ? hotDeals.map(d => `
### ${d.company}
- **Montant :** ${d.value.toLocaleString('fr-FR')} €
- **Phase :** ${d.stage}
- **Probabilité :** ${d.probability}%
${d.nextStep ? `- **Prochaine étape :** ${d.nextStep}` : ''}
`).join('\n') : 'Aucun deal en phase critique'}

---

## 📈 VOS OBJECTIFS DU JOUR

1. ✅ Finaliser [X] actions
2. ✅ Contacter [Y] leads chauds
3. ✅ Faire avancer [Z] deals
4. ✅ Mettre à jour le CRM

---

💡 **Conseil du jour** :
Concentrez-vous sur les deals à haute valeur et haute probabilité.
Un deal gagné vaut mieux que dix prospects tièdes !

---

*Bonne journée et bon courage ! 💪*
`
  }
}
