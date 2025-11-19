// Types pour la gestion vocale et le mode conversationnel

export type VoiceMode = 'disabled' | 'automatic' | 'manual'
export type VoiceState = 'idle' | 'listening-wake-word' | 'active' | 'speaking'

export interface VoiceSettings {
  mode: VoiceMode
  wakeWord: string // "hey agent", "agent", etc.
  conversationalMode: boolean
  autoSpeak: boolean // L'IA parle automatiquement ses réponses
  language: string
  voiceSpeed: number
}

export interface ConversationalState {
  isActive: boolean
  context: Record<string, any>
  itemsCreated: {
    deals: string[] // IDs des deals créés
    actions: string[] // IDs des actions créées
  }
  currentStep?: 'greeting' | 'gathering' | 'confirming' | 'completed'
  pendingData?: any
  conversationStartTime?: Date
  lastInteractionTime?: Date
}

export interface PendingAction {
  type: 'create_deal' | 'create_action' | 'update_deal' | 'update_action'
  data: any
  confirmationMessage: string
  confidence: number
  awaitingConfirmation: boolean
  targetItemId?: string // ID de l'item à modifier (pour update)
}

export interface IntentDetection {
  intent: 'create_deal' | 'create_action' | 'update_deal' | 'update_action' | 'query' | 'modify' | 'confirm' | 'cancel' | 'unknown'
  confidence: number
  entities: Record<string, any>
  targetIdentifier?: string // Identifiant de l'item ciblé (nom client, titre action, etc.)
}

export interface AIResponse {
  message: string
  intent?: IntentDetection
  actionProposal?: PendingAction
  shouldSpeak: boolean
  endConversation?: boolean
  itemCreated?: {
    type: 'deal' | 'action'
    id: string
    data: any
  }
}
