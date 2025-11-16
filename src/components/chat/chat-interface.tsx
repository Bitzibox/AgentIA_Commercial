"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"
import { nanoid } from 'nanoid'

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  agentType?: string
}

interface ChatInterfaceProps {
  userId?: string
  className?: string
}

export function ChatInterface({ userId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre copilot commercial IA. Je peux vous aider avec l'analyse de vos ventes, la rédaction d'emails, la gestion de votre CRM et des conseils commerciaux. Comment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId] = useState(() => nanoid())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Ajouter le message utilisateur immédiatement
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Appel à l'API locale Ollama
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          userId: userId || 'demo-user',
          conversationId: conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Ajouter la réponse de l'assistant
      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: data.message?.content || data.response || "Pas de réponse",
        timestamp: new Date(),
        agentType: data.metadata?.agentType,
      }

      setMessages((prev) => [...prev, assistantMessage])

    } catch (error) {
      console.error("[Chat] Erreur:", error)

      // Message d'erreur
      const errorMessage: Message = {
        id: nanoid(),
        role: "assistant",
        content: "Désolé, j'ai rencontré une erreur. Vérifiez qu'Ollama est bien démarré et accessible. Erreur : " + (error instanceof Error ? error.message : "Erreur inconnue"),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Chat Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Copilot Commercial</h1>
          <p className="text-sm text-muted-foreground">
            Assistant IA 100% local - Propulsé par Ollama
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">Ollama connecté</span>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className={cn(
                  "text-xs",
                  message.role === "assistant"
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}>
                  {message.role === "assistant" ? (
                    <Bot className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3",
                  message.role === "assistant"
                    ? "bg-card text-card-foreground border border-border"
                    : "bg-accent text-accent-foreground"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-50">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  {message.agentType && (
                    <span className="text-xs opacity-50">
                      • {message.agentType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-accent text-accent-foreground">
                  <Bot className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Analyse en cours...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez une question sur vos ventes, demandez un email, ou des conseils..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="mx-auto max-w-3xl mt-2 text-xs text-muted-foreground text-center">
          Vos données restent 100% locales et privées
        </p>
      </div>
    </div>
  )
}
