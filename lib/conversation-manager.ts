import { Message } from "@/types"

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  archived: boolean
}

const CONVERSATIONS_KEY = "agent-commercial-conversations"
const ACTIVE_CONVERSATION_KEY = "agent-commercial-active-conversation"

export class ConversationManager {
  private static instance: ConversationManager | null = null

  private constructor() {}

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager()
    }
    return ConversationManager.instance
  }

  // Charger toutes les conversations
  loadConversations(): Conversation[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(CONVERSATIONS_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Reconvertir les dates
        return parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          archived: conv.archived ?? false, // Default to false for old conversations
          messages: conv.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        }))
      } catch (error) {
        console.error("Erreur chargement conversations:", error)
        return []
      }
    }
    return []
  }

  // Sauvegarder toutes les conversations
  saveConversations(conversations: Conversation[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  }

  // Créer une nouvelle conversation
  createConversation(): Conversation {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "Nouvelle conversation",
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "Bonjour ! Je suis votre copilote commercial IA. Je peux vous aider à analyser vos ventes, prioriser vos opportunités, préparer vos rendez-vous clients et bien plus. Comment puis-je vous assister aujourd'hui ?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
    }

    const conversations = this.loadConversations()
    conversations.unshift(newConversation) // Ajouter en premier
    this.saveConversations(conversations)
    this.setActiveConversation(newConversation.id)

    return newConversation
  }

  // Mettre à jour une conversation
  updateConversation(id: string, messages: Message[]): void {
    const conversations = this.loadConversations()
    const index = conversations.findIndex((c) => c.id === id)
    if (index !== -1) {
      conversations[index].messages = messages
      conversations[index].updatedAt = new Date()

      // Générer un titre basé sur le premier message utilisateur
      if (conversations[index].title === "Nouvelle conversation" && messages.length > 1) {
        const firstUserMessage = messages.find((m) => m.role === "user")
        if (firstUserMessage) {
          conversations[index].title = this.generateTitle(firstUserMessage.content)
        }
      }

      this.saveConversations(conversations)
    }
  }

  // Générer un titre à partir du contenu
  generateTitle(content: string): string {
    // Prendre les 50 premiers caractères et ajouter "..." si tronqué
    const title = content.slice(0, 50).trim()
    return content.length > 50 ? `${title}...` : title
  }

  // Supprimer une conversation
  deleteConversation(id: string): void {
    const conversations = this.loadConversations()
    const filtered = conversations.filter((c) => c.id !== id)
    this.saveConversations(filtered)

    // Si c'était la conversation active, activer la première disponible
    const activeId = this.getActiveConversationId()
    if (activeId === id) {
      if (filtered.length > 0) {
        this.setActiveConversation(filtered[0].id)
      } else {
        localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
      }
    }
  }

  // Archiver une conversation
  archiveConversation(id: string): void {
    const conversations = this.loadConversations()
    const index = conversations.findIndex((c) => c.id === id)
    if (index !== -1) {
      conversations[index].archived = true
      conversations[index].updatedAt = new Date()
      this.saveConversations(conversations)

      // Si c'était la conversation active, activer la première conversation non archivée
      const activeId = this.getActiveConversationId()
      if (activeId === id) {
        const activeConv = conversations.find((c) => !c.archived)
        if (activeConv) {
          this.setActiveConversation(activeConv.id)
        } else {
          localStorage.removeItem(ACTIVE_CONVERSATION_KEY)
        }
      }
    }
  }

  // Désarchiver une conversation
  unarchiveConversation(id: string): void {
    const conversations = this.loadConversations()
    const index = conversations.findIndex((c) => c.id === id)
    if (index !== -1) {
      conversations[index].archived = false
      conversations[index].updatedAt = new Date()
      this.saveConversations(conversations)
    }
  }

  // Obtenir une conversation par ID
  getConversation(id: string): Conversation | null {
    const conversations = this.loadConversations()
    return conversations.find((c) => c.id === id) || null
  }

  // Définir la conversation active
  setActiveConversation(id: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(ACTIVE_CONVERSATION_KEY, id)
  }

  // Obtenir l'ID de la conversation active
  getActiveConversationId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ACTIVE_CONVERSATION_KEY)
  }

  // Obtenir ou créer la conversation active
  getOrCreateActiveConversation(): Conversation {
    const activeId = this.getActiveConversationId()
    if (activeId) {
      const conversation = this.getConversation(activeId)
      if (conversation) return conversation
    }

    // Si pas de conversation active ou introuvable, en créer une nouvelle
    return this.createConversation()
  }
}

export const conversationManager = ConversationManager.getInstance()
