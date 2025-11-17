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
}

export interface BusinessContext {
  metrics: BusinessMetrics
  topDeals: Deal[]
  recentActivities: Activity[]
  actionItems: ActionItem[]
  hotLeads: Lead[]
}
