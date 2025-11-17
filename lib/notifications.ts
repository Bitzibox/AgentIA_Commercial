import { BusinessContext, Deal, ActionItem, Lead } from "@/types"

export interface Notification {
  id: string
  type: "warning" | "info" | "success" | "urgent"
  category: "deal" | "action" | "lead" | "pipeline"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: {
    type: "deal" | "action" | "lead"
    id: string
    label: string
  }
}

export class NotificationEngine {
  // Générer des notifications intelligentes basées sur le contexte business
  static generateNotifications(context: BusinessContext): Notification[] {
    const notifications: Notification[] = []
    const now = new Date()

    // 1. Deals stagnants (> 10 jours sans activité)
    context.topDeals.forEach(deal => {
      if (deal.stage === "Gagné" || deal.stage === "Perdu") return

      const daysSinceActivity = Math.floor(
        (now.getTime() - new Date(deal.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysSinceActivity > 10) {
        notifications.push({
          id: `stagnant-${deal.id}`,
          type: "warning",
          category: "deal",
          title: `Deal stagnant : ${deal.company}`,
          message: `Aucune activité depuis ${daysSinceActivity} jours. Contact : ${deal.contact}. Valeur : ${deal.value.toLocaleString('fr-FR')} €`,
          timestamp: now,
          read: false,
          actionable: {
            type: "deal",
            id: deal.id,
            label: "Voir l'opportunité"
          }
        })
      } else if (daysSinceActivity > 7 && deal.probability >= 60) {
        notifications.push({
          id: `followup-${deal.id}`,
          type: "info",
          category: "deal",
          title: `Relance recommandée : ${deal.company}`,
          message: `Deal à forte probabilité (${deal.probability}%) sans activité depuis ${daysSinceActivity} jours`,
          timestamp: now,
          read: false,
          actionable: {
            type: "deal",
            id: deal.id,
            label: "Relancer"
          }
        })
      }
    })

    // 2. Actions en retard
    const overdueActions = context.actionItems.filter(
      a => a.dueDate && new Date(a.dueDate) < now && !a.completed
    )

    if (overdueActions.length > 0) {
      const highPriorityOverdue = overdueActions.filter(a => a.priority === "high")

      if (highPriorityOverdue.length > 0) {
        notifications.push({
          id: "overdue-high-priority",
          type: "urgent",
          category: "action",
          title: `${highPriorityOverdue.length} action${highPriorityOverdue.length > 1 ? 's' : ''} urgente${highPriorityOverdue.length > 1 ? 's' : ''} en retard`,
          message: highPriorityOverdue.map(a => `• ${a.title}`).join('\n'),
          timestamp: now,
          read: false,
          actionable: {
            type: "action",
            id: "actions",
            label: "Voir les actions"
          }
        })
      } else {
        notifications.push({
          id: "overdue-actions",
          type: "warning",
          category: "action",
          title: `${overdueActions.length} action${overdueActions.length > 1 ? 's' : ''} en retard`,
          message: `Vous avez des actions à finaliser`,
          timestamp: now,
          read: false,
          actionable: {
            type: "action",
            id: "actions",
            label: "Voir les actions"
          }
        })
      }
    }

    // 3. Actions dues aujourd'hui
    const todayActions = context.actionItems.filter(a => {
      if (!a.dueDate || a.completed) return false
      const dueDate = new Date(a.dueDate)
      const today = new Date()
      return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
      )
    })

    if (todayActions.length > 0) {
      notifications.push({
        id: "due-today",
        type: "info",
        category: "action",
        title: `${todayActions.length} action${todayActions.length > 1 ? 's' : ''} à faire aujourd'hui`,
        message: todayActions.map(a => `• ${a.title}`).join('\n'),
        timestamp: now,
        read: false
      })
    }

    // 4. Leads chauds non contactés
    const hotUncontactedLeads = context.hotLeads.filter(
      lead => lead.score >= 80 && lead.status === "Nouveau"
    )

    if (hotUncontactedLeads.length > 0) {
      notifications.push({
        id: "hot-leads",
        type: "urgent",
        category: "lead",
        title: `${hotUncontactedLeads.length} lead${hotUncontactedLeads.length > 1 ? 's' : ''} chaud${hotUncontactedLeads.length > 1 ? 's' : ''} à contacter !`,
        message: `Leads avec score > 80 : ${hotUncontactedLeads.map(l => l.company).slice(0, 3).join(", ")}${hotUncontactedLeads.length > 3 ? '...' : ''}`,
        timestamp: now,
        read: false,
        actionable: {
          type: "lead",
          id: "leads",
          label: "Voir les leads"
        }
      })
    }

    // 5. Deals en phase de closing (opportunités à fort potentiel)
    const closingDeals = context.topDeals.filter(
      d => (d.stage === "Négociation" || d.stage === "Closing") && d.probability >= 60
    )

    if (closingDeals.length > 0) {
      const totalValue = closingDeals.reduce((sum, d) => sum + d.value, 0)
      notifications.push({
        id: "closing-opportunities",
        type: "success",
        category: "deal",
        title: `${closingDeals.length} deal${closingDeals.length > 1 ? 's' : ''} proche${closingDeals.length > 1 ? 's' : ''} du closing 🔥`,
        message: `Valeur totale : ${totalValue.toLocaleString('fr-FR')} € - Concentrez vos efforts !`,
        timestamp: now,
        read: false
      })
    }

    // 6. Pipeline déséquilibré
    const pipelineCheck = this.checkPipelineBalance(context.topDeals)
    if (!pipelineCheck.balanced) {
      notifications.push({
        id: "pipeline-imbalance",
        type: "warning",
        category: "pipeline",
        title: "Pipeline déséquilibré",
        message: pipelineCheck.message,
        timestamp: now,
        read: false
      })
    }

    // 7. Deals à forte valeur sans activité récente
    const highValueDeals = context.topDeals.filter(d => {
      if (d.stage === "Gagné" || d.stage === "Perdu") return false
      const daysSinceActivity = Math.floor(
        (now.getTime() - new Date(d.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
      )
      return d.value >= 50000 && daysSinceActivity > 5
    })

    if (highValueDeals.length > 0) {
      notifications.push({
        id: "high-value-attention",
        type: "warning",
        category: "deal",
        title: `${highValueDeals.length} deal${highValueDeals.length > 1 ? 's' : ''} à forte valeur nécessite${highValueDeals.length === 1 ? '' : 'nt'} votre attention`,
        message: highValueDeals.slice(0, 3).map(d =>
          `• ${d.company} (${d.value.toLocaleString('fr-FR')} €)`
        ).join('\n'),
        timestamp: now,
        read: false
      })
    }

    // Trier par priorité : urgent > warning > success > info
    const priorityOrder = { urgent: 4, warning: 3, success: 2, info: 1 }
    return notifications.sort((a, b) => priorityOrder[b.type] - priorityOrder[a.type])
  }

  // Vérifier l'équilibre du pipeline
  private static checkPipelineBalance(deals: Deal[]): { balanced: boolean; message: string } {
    const activeDeals = deals.filter(d => d.stage !== "Gagné" && d.stage !== "Perdu")
    if (activeDeals.length === 0) {
      return {
        balanced: false,
        message: "Aucun deal actif dans votre pipeline. Intensifiez la prospection !"
      }
    }

    const stages = ["Prospection", "Qualification", "Proposition", "Négociation", "Closing"]
    const distribution = stages.map(stage => ({
      stage,
      count: activeDeals.filter(d => d.stage === stage).length
    }))

    const emptyStages = distribution.filter(d => d.count === 0)

    if (emptyStages.length >= 3) {
      return {
        balanced: false,
        message: `Plusieurs phases vides : ${emptyStages.map(s => s.stage).join(", ")}. Diversifiez vos efforts !`
      }
    }

    if (emptyStages.length > 0 && emptyStages.some(s => s.stage === "Prospection")) {
      return {
        balanced: false,
        message: "Aucun deal en prospection. Pensez à alimenter votre pipeline !"
      }
    }

    return { balanced: true, message: "" }
  }
}
