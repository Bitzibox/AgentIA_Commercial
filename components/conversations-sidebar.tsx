"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, MessageSquare, Trash2, X, Menu } from "lucide-react"
import { conversationManager, Conversation } from "@/lib/conversation-manager"
import { cn } from "@/lib/utils"

interface ConversationsSidebarProps {
  activeConversationId: string | null
  onConversationChange: (conversationId: string) => void
  onNewConversation: () => void
}

export function ConversationsSidebar({
  activeConversationId,
  onConversationChange,
  onNewConversation,
}: ConversationsSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [activeConversationId])

  const loadConversations = () => {
    const loaded = conversationManager.loadConversations()
    setConversations(loaded)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm("Supprimer cette conversation ?")) {
      conversationManager.deleteConversation(id)
      loadConversations()

      // Si c'était la conversation active, charger une autre
      if (id === activeConversationId) {
        const remaining = conversationManager.loadConversations()
        if (remaining.length > 0) {
          onConversationChange(remaining[0].id)
        } else {
          onNewConversation()
        }
      }
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Aujourd'hui"
    if (days === 1) return "Hier"
    if (days < 7) return `Il y a ${days} jours`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <>
      {/* Toggle button for mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          !isOpen && "lg:-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversations
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={onNewConversation}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>

        {/* List of conversations */}
        <ScrollArea className="flex-1 p-2">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune conversation
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => {
                    onConversationChange(conversation.id)
                    setIsMobileOpen(false)
                  }}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    activeConversationId === conversation.id
                      ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => handleDelete(e, conversation.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
