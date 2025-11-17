"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message } from "@/types"
import { geminiClientService } from "@/lib/gemini-client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatInterfaceProps {
  businessContext?: any
}

export function ChatInterface({ businessContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre **copilote commercial IA**. Je peux vous aider à analyser vos ventes, prioriser vos opportunités, préparer vos rendez-vous clients et bien plus.\n\nComment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll quand les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingMessage])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Vérifier que la clé API est configurée
    if (!geminiClientService.hasApiKey()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "⚠️ **Configuration requise**\n\nVeuillez configurer votre clé API Gemini en cliquant sur le bouton en haut à droite de l'écran.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setStreamingMessage("")

    try {
      // Appeler Gemini avec streaming
      const finalResponse = await geminiClientService.chatStream(
        [...messages, userMessage].map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: m.content,
        })),
        businessContext,
        (text) => {
          // Callback pour chaque chunk reçu
          setStreamingMessage(text)
        }
      )

      // Une fois le streaming terminé, ajouter le message final
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: finalResponse || "Désolé, je n'ai pas pu générer de réponse.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingMessage("")
    } catch (error: any) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ **Erreur**\n\n${error.message || "Une erreur s'est produite. Veuillez réessayer."}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setStreamingMessage("")
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

  const suggestedQuestions = [
    "Quelles sont mes opportunités prioritaires ?",
    "Comment améliorer mon taux de conversion ?",
    "Quel est l'état de mon pipeline ?",
    "Prépare-moi pour mon RDV avec TechCorp",
  ]

  // Composant pour le rendu markdown avec styles optimisés
  const MarkdownContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-h1:text-xl prose-h1:mt-4 prose-h1:mb-3
        prose-h2:text-lg prose-h2:mt-3 prose-h2:mb-2
        prose-h3:text-base prose-h3:mt-2 prose-h3:mb-1.5
        prose-p:my-2 prose-p:leading-7 prose-p:text-foreground
        prose-ul:my-2 prose-ul:space-y-1
        prose-ol:my-2 prose-ol:space-y-1
        prose-li:my-0.5 prose-li:text-foreground
        prose-strong:font-semibold prose-strong:text-foreground
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-muted prose-pre:border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
        prose-table:border-collapse prose-table:w-full prose-table:my-3
        prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
        break-words"
    >
      {content}
    </ReactMarkdown>
  )

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Copilote Commercial IA</h2>
            <p className="text-sm text-muted-foreground">Propulsé par Gemini Flash</p>
          </div>
        </div>
      </div>

      {/* Messages Container - Style ChatGPT */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-background"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" && "flex justify-end"
              )}
            >
              <div className={cn(
                "flex gap-4 max-w-full",
                message.role === "user" && "flex-row-reverse"
              )}>
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 min-w-0 space-y-2",
                  message.role === "user" && "flex flex-col items-end"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-3 inline-block max-w-full",
                    message.role === "assistant"
                      ? "bg-muted"
                      : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                  )}>
                    {message.role === "assistant" ? (
                      <MarkdownContent content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground px-1">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming Message */}
          {isLoading && streamingMessage && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-4 max-w-full">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="rounded-2xl px-4 py-3 bg-muted max-w-full">
                    <MarkdownContent content={streamingMessage} />
                    <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Génération en cours...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && !streamingMessage && (
            <div className="mb-6">
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analyse en cours...</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium text-muted-foreground px-1">
                💡 Questions suggérées :
              </p>
              <div className="grid gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left text-sm p-3 rounded-xl border border-border bg-card hover:bg-muted transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-background px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            disabled={isLoading}
            className="flex-1 bg-muted border-0 focus-visible:ring-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
