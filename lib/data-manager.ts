import { BusinessContext, Deal, Lead, Activity, ActionItem, BusinessMetrics, Quote, QuoteItem } from "@/types"
import { demoBusinessContext } from "./demo-data"

const STORAGE_KEY = "agent-commercial-data"

export class DataManager {
  private static instance: DataManager | null = null

  private constructor() {}

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  // Charger les données depuis localStorage ou utiliser les données de démo
  loadData(): BusinessContext {
    if (typeof window === "undefined") {
      return demoBusinessContext
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Reconvertir les dates
        const data = this.hydrateDates(parsed)
        // Trier les deals par date décroissante (plus récent en premier)
        data.topDeals.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
        return data
      } catch (error) {
        console.error("Erreur chargement données:", error)
        return demoBusinessContext
      }
    }

    // Première utilisation : sauvegarder les données de démo
    const data = { ...demoBusinessContext }
    // Trier les deals par date décroissante (plus récent en premier)
    data.topDeals.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
    this.saveData(data)
    return data
  }

  // Sauvegarder les données
  saveData(data: BusinessContext): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  // Réinitialiser aux données de démo
  resetToDemo(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  }

  // Reconvertir les strings de dates en objets Date
  private hydrateDates(data: any): BusinessContext {
    // Deals
    data.topDeals = data.topDeals.map((deal: any) => ({
      ...deal,
      lastActivity: new Date(deal.lastActivity),
    }))

    // Leads
    data.hotLeads = data.hotLeads.map((lead: any) => ({
      ...lead,
      createdAt: new Date(lead.createdAt),
      lastContact: lead.lastContact ? new Date(lead.lastContact) : undefined,
    }))

    // Activities
    data.recentActivities = data.recentActivities.map((activity: any) => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
    }))

    // Actions
    data.actionItems = data.actionItems.map((action: any) => ({
      ...action,
      dueDate: action.dueDate ? new Date(action.dueDate) : undefined,
    }))

    // Quotes
    if (data.quotes) {
      data.quotes = data.quotes.map((quote: any) => ({
        ...quote,
        createdAt: new Date(quote.createdAt),
        expiresAt: new Date(quote.expiresAt),
        sentAt: quote.sentAt ? new Date(quote.sentAt) : undefined,
        acceptedAt: quote.acceptedAt ? new Date(quote.acceptedAt) : undefined,
        openedAt: quote.openedAt ? new Date(quote.openedAt) : undefined,
      }))
    }

    return data
  }

  // Ajouter un deal
  addDeal(deal: Omit<Deal, "id">): Deal {
    const data = this.loadData()
    const newDeal: Deal = {
      ...deal,
      id: Date.now().toString(),
    }
    data.topDeals.push(newDeal)
    this.updateMetrics(data)
    this.saveData(data)
    return newDeal
  }

  // Modifier un deal
  updateDeal(id: string, updates: Partial<Deal>): Deal | null {
    const data = this.loadData()
    const index = data.topDeals.findIndex((d) => d.id === id)
    if (index === -1) return null

    data.topDeals[index] = { ...data.topDeals[index], ...updates }
    this.updateMetrics(data)
    this.saveData(data)
    return data.topDeals[index]
  }

  // Supprimer un deal
  deleteDeal(id: string): boolean {
    const data = this.loadData()
    const index = data.topDeals.findIndex((d) => d.id === id)
    if (index === -1) return false

    data.topDeals.splice(index, 1)
    this.updateMetrics(data)
    this.saveData(data)
    return true
  }

  // Ajouter un lead
  addLead(lead: Omit<Lead, "id">): Lead {
    const data = this.loadData()
    const newLead: Lead = {
      ...lead,
      id: Date.now().toString(),
    }
    data.hotLeads.push(newLead)
    this.updateMetrics(data)
    this.saveData(data)
    return newLead
  }

  // Modifier un lead
  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const data = this.loadData()
    const index = data.hotLeads.findIndex((l) => l.id === id)
    if (index === -1) return null

    data.hotLeads[index] = { ...data.hotLeads[index], ...updates }
    this.updateMetrics(data)
    this.saveData(data)
    return data.hotLeads[index]
  }

  // Supprimer un lead
  deleteLead(id: string): boolean {
    const data = this.loadData()
    const index = data.hotLeads.findIndex((l) => l.id === id)
    if (index === -1) return false

    data.hotLeads.splice(index, 1)
    this.updateMetrics(data)
    this.saveData(data)
    return true
  }

  // Ajouter une activité
  addActivity(activity: Omit<Activity, "id">): Activity {
    const data = this.loadData()
    const newActivity: Activity = {
      ...activity,
      id: Date.now().toString(),
    }
    data.recentActivities.unshift(newActivity)
    // Garder seulement les 20 dernières
    data.recentActivities = data.recentActivities.slice(0, 20)
    this.saveData(data)
    return newActivity
  }

  // Ajouter une action
  addAction(action: Omit<ActionItem, "id">): ActionItem {
    const data = this.loadData()
    const newAction: ActionItem = {
      ...action,
      id: Date.now().toString(),
    }
    data.actionItems.push(newAction)
    this.saveData(data)
    return newAction
  }

  // Modifier une action
  updateAction(id: string, updates: Partial<ActionItem>): ActionItem | null {
    const data = this.loadData()
    const index = data.actionItems.findIndex((a) => a.id === id)
    if (index === -1) return null

    data.actionItems[index] = { ...data.actionItems[index], ...updates }
    this.saveData(data)
    return data.actionItems[index]
  }

  // Supprimer une action
  deleteAction(id: string): boolean {
    const data = this.loadData()
    const index = data.actionItems.findIndex((a) => a.id === id)
    if (index === -1) return false

    data.actionItems.splice(index, 1)
    this.saveData(data)
    return true
  }

  // Mettre à jour manuellement les métriques
  updateMetricsManually(metrics: BusinessMetrics): void {
    const data = this.loadData()
    data.metrics = metrics
    this.saveData(data)
  }

  // Mettre à jour les métriques en fonction des deals
  private updateMetrics(data: BusinessContext): void {
    // Calculer le pipeline total
    data.metrics.pipelineValue = data.topDeals.reduce((sum, deal) => sum + deal.value, 0)

    // Calculer la moyenne des deals
    if (data.topDeals.length > 0) {
      data.metrics.averageDealSize = data.metrics.pipelineValue / data.topDeals.length
    }

    // Calculer le nombre de leads
    data.metrics.leads = data.hotLeads.length

    // Le reste des métriques peut être mis à jour manuellement par l'utilisateur
  }

  // Export des données en JSON
  exportData(): string {
    const data = this.loadData()
    return JSON.stringify(data, null, 2)
  }

  // Import des données depuis JSON
  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      this.saveData(data)
      return true
    } catch (error) {
      console.error("Erreur import:", error)
      return false
    }
  }

  // ============= GESTION DES DEVIS =============

  // Générer un numéro de devis automatique
  private generateQuoteNumber(): string {
    const data = this.loadData()
    const quotes = data.quotes || []
    const year = new Date().getFullYear()
    const count = quotes.filter(q => q.quoteNumber.includes(year.toString())).length + 1
    return `DEVIS-${year}-${count.toString().padStart(3, '0')}`
  }

  // Ajouter un devis
  addQuote(quote: Omit<Quote, "id" | "quoteNumber" | "createdAt" | "expiresAt" | "opened" | "openCount">): Quote {
    const data = this.loadData()
    if (!data.quotes) {
      data.quotes = []
    }

    const createdAt = new Date()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (quote.validityDays || 30))

    const newQuote: Quote = {
      ...quote,
      id: Date.now().toString(),
      quoteNumber: this.generateQuoteNumber(),
      createdAt,
      expiresAt,
      opened: false,
      openCount: 0,
      status: quote.status || "Brouillon",
      validityDays: quote.validityDays || 30,
      paymentTerms: quote.paymentTerms || "30 jours nets",
      trackingId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    data.quotes.push(newQuote)
    this.saveData(data)
    return newQuote
  }

  // Modifier un devis
  updateQuote(id: string, updates: Partial<Quote>): Quote | null {
    const data = this.loadData()
    if (!data.quotes) return null

    const index = data.quotes.findIndex((q) => q.id === id)
    if (index === -1) return null

    // Recalculer la date d'expiration si validityDays change
    if (updates.validityDays && data.quotes[index].createdAt) {
      const expiresAt = new Date(data.quotes[index].createdAt)
      expiresAt.setDate(expiresAt.getDate() + updates.validityDays)
      updates.expiresAt = expiresAt
    }

    // Recalculer les montants si les items changent
    if (updates.items) {
      const subtotal = updates.items.reduce((sum, item) => sum + item.total, 0)
      const taxAmount = updates.items.reduce((sum, item) => {
        const taxRate = item.taxRate || 0
        return sum + (item.total * taxRate / 100)
      }, 0)
      updates.subtotal = subtotal
      updates.taxAmount = taxAmount
      updates.totalAmount = subtotal + taxAmount
    }

    data.quotes[index] = { ...data.quotes[index], ...updates }
    this.saveData(data)
    return data.quotes[index]
  }

  // Supprimer un devis
  deleteQuote(id: string): boolean {
    const data = this.loadData()
    if (!data.quotes) return false

    const index = data.quotes.findIndex((q) => q.id === id)
    if (index === -1) return false

    data.quotes.splice(index, 1)
    this.saveData(data)
    return true
  }

  // Obtenir un devis par ID
  getQuote(id: string): Quote | null {
    const data = this.loadData()
    if (!data.quotes) return null
    return data.quotes.find((q) => q.id === id) || null
  }

  // Obtenir tous les devis
  getQuotes(): Quote[] {
    const data = this.loadData()
    return data.quotes || []
  }

  // Marquer un devis comme ouvert (tracking)
  markQuoteAsOpened(trackingId: string): boolean {
    const data = this.loadData()
    if (!data.quotes) return false

    const quote = data.quotes.find((q) => q.trackingId === trackingId)
    if (!quote) return false

    quote.opened = true
    quote.openCount = (quote.openCount || 0) + 1
    if (!quote.openedAt) {
      quote.openedAt = new Date()
    }
    if (quote.status === "Envoyé") {
      quote.status = "Vu"
    }

    this.saveData(data)
    return true
  }

  // Marquer un devis comme envoyé
  markQuoteAsSent(id: string, sentBy: "email" | "whatsapp" | "manual"): Quote | null {
    const data = this.loadData()
    if (!data.quotes) return null

    const index = data.quotes.findIndex((q) => q.id === id)
    if (index === -1) return null

    data.quotes[index].sentAt = new Date()
    data.quotes[index].status = "Envoyé"
    data.quotes[index].sentBy = sentBy

    this.saveData(data)
    return data.quotes[index]
  }

  // Marquer un devis comme accepté
  markQuoteAsAccepted(id: string): Quote | null {
    const data = this.loadData()
    if (!data.quotes) return null

    const index = data.quotes.findIndex((q) => q.id === id)
    if (index === -1) return null

    data.quotes[index].acceptedAt = new Date()
    data.quotes[index].status = "Accepté"

    this.saveData(data)
    return data.quotes[index]
  }

  // Vérifier et mettre à jour les devis expirés
  updateExpiredQuotes(): void {
    const data = this.loadData()
    if (!data.quotes) return

    const now = new Date()
    let hasChanges = false

    data.quotes.forEach(quote => {
      if (quote.status === "Envoyé" || quote.status === "Vu") {
        if (quote.expiresAt < now) {
          quote.status = "Expiré"
          hasChanges = true
        }
      }
    })

    if (hasChanges) {
      this.saveData(data)
    }
  }
}

export const dataManager = DataManager.getInstance()
