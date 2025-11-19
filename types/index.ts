export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isGenerated?: boolean // Indique si le contenu a été généré par une commande slash
}

export interface BusinessMetrics {
  revenue: number
  revenueGrowth: number
  leads: number
  leadsGrowth: number
  conversionRate: number
  conversionRateChange: number
  pipelineValue: number
  pipelineGrowth: number
  averageDealSize: number
  salesCycle: number
}

export interface Deal {
  id: string
  company: string
  value: number
  stage: "Prospection" | "Qualification" | "Proposition" | "Négociation" | "Closing" | "Gagné" | "Perdu"
  probability: number
  contact: string
  lastActivity: Date
  nextStep?: string
  tags?: string[]
  // Properties for voice features (aliases)
  client?: string // alias for company
  amount?: number // alias for value
  status?: string // alias for stage
  description?: string
  expectedCloseDate?: string
}

export interface Lead {
  id: string
  company: string
  contact: string
  email: string
  phone?: string
  source: string
  score: number
  status: "Nouveau" | "Contacté" | "Qualifié" | "Non qualifié"
  createdAt: Date
  lastContact?: Date
  notes?: string
}

export interface Activity {
  id: string
  type: "call" | "email" | "meeting" | "demo" | "proposal" | "won" | "lost"
  description: string
  company?: string
  value?: number
  timestamp: Date
}

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  dueDate?: Date
  completed: boolean
  relatedTo?: {
    type: "deal" | "lead"
    id: string
    name: string
  }
  // Properties for voice features
  type?: "call" | "email" | "meeting" | "task"
  status?: "todo" | "done" | "cancelled"
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxRate?: number // Taux de TVA en pourcentage (ex: 20 pour 20%)
}

export interface Quote {
  id: string
  quoteNumber: string // Numéro du devis (ex: "DEVIS-2024-001")
  company: string // Nom du client
  contact: string
  email: string
  phone?: string
  address?: string

  // Lignes du devis
  items: QuoteItem[]

  // Montants
  subtotal: number // Sous-total HT
  taxAmount: number // Montant total TVA
  totalAmount: number // Montant total TTC

  // Conditions
  validityDays: number // Durée de validité (ex: 30 jours)
  paymentTerms: string // Conditions de paiement (ex: "30 jours nets")
  notes?: string // Notes ou conditions particulières

  // Dates
  createdAt: Date
  expiresAt: Date
  sentAt?: Date
  acceptedAt?: Date

  // Statut
  status: "Brouillon" | "Envoyé" | "Vu" | "Accepté" | "Refusé" | "Expiré"

  // Tracking
  opened: boolean
  openedAt?: Date
  openCount: number // Nombre de fois que le devis a été ouvert

  // Relation avec opportunité
  relatedDeal?: {
    id: string
    name: string
  }

  // Métadonnées d'envoi
  sentBy?: "email" | "whatsapp" | "manual"
  trackingId?: string // ID unique pour le tracking d'ouverture

  // Configuration d'apparence
  template?: "default" | "modern" | "minimal" // Template PDF
  color?: string // Couleur principale du PDF
  logo?: string // URL ou base64 du logo
}

export interface BusinessContext {
  metrics: BusinessMetrics
  topDeals: Deal[]
  recentActivities: Activity[]
  actionItems: ActionItem[]
  hotLeads: Lead[]
  quotes?: Quote[] // Liste des devis
}
