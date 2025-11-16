/**
 * Types TypeScript centralisés
 */

// ========================================
// Types CRM
// ========================================

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'lost'

export type DealStage =
  | 'discovery'
  | 'qualification'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'

export type ActivityType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'task_completed'
  | 'deal_stage_changed'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// ========================================
// Types Chat et IA
// ========================================

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  agentType?: string
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

// ========================================
// Types API
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ========================================
// Types Analytics
// ========================================

export interface MetricData {
  type: string
  value: number
  unit?: string
  change?: number // Changement en % par rapport à la période précédente
  trend?: 'up' | 'down' | 'stable'
}

export interface PipelineMetrics {
  totalDeals: number
  totalValue: number
  averageValue: number
  conversionRate: number
  topDeals: Array<{
    id: string
    title: string
    value: number
    stage: DealStage
    probability: number
  }>
  dealsByStage: Record<DealStage, number>
}
