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

// Composant pour afficher le markdown avec un beau style
const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className="prose prose-sm dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:text-foreground
      prose-h1:text-xl prose-h1:mt-4 prose-h1:mb-3
      prose-h2:text-lg prose-h2:mt-3 prose-h2:mb-2
      prose-h3:text-base prose-h3:mt-2 prose-h3:mb-1.5
      prose-p:my-1.5 prose-p:leading-7 prose-p:text-foreground
      prose-strong:text-foreground prose-strong:font-semibold
      prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
      prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
      prose-li:my-1 prose-li:text-foreground
      prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
      prose-hr:my-4 prose-hr:border-border
      prose-table:border-collapse prose-table:w-full prose-table:my-3
      prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted
      prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
      prose-a:text-primary prose-a:underline prose-a:underline-offset-2
      break-words"
  >
    {content}
  </ReactMarkdown>
)

export function ChatInterface({ businessContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bonjour ! Je suis votre copilote commercial IA. Je peux vous aider à analyser vos ventes, prioriser vos opportunités, préparer vos rendez-vous clients et bien plus. Comment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas quand il y a de nouveaux messages ou streaming
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
        content:
          "Veuillez configurer votre clé API Gemini en cliquant sur le bouton en haut à droite de l'écran.",
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
    setStreamingMessage("") // Réinitialiser le message en streaming

    try {
      // Utiliser chatStream pour le streaming en temps réel
      const finalResponse = await geminiClientService.chatStream(
        [...messages, userMessage].map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: m.content,
        })),
        businessContext,
        (text) => {
          // Callback appelé à chaque chunk - affichage progressif
          setStreamingMessage(text)
        }
      )

      // Une fois terminé, ajouter le message complet à l'historique
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: finalResponse || "Désolé, je n'ai pas pu générer de réponse.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setStreamingMessage("") // Nettoyer le streaming
    } catch (error: any) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setStreamingMessage("") // Nettoyer le streaming
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header fixe en haut */}
      <div className="border-b bg-background px-6 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Copilote Commercial IA</h2>
        </div>
      </div>

      {/* Zone de messages scrollable - Style ChatGPT */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-background"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Messages existants */}
          {messages.map((message) => (
            <div
              key={message.id}
              className="mb-6"
            >
              <div className="flex gap-4 max-w-full">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      message.role === "assistant"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-full",
                      message.role === "assistant"
                        ? "bg-muted/50"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownContent content={message.content} />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                  </div>
                  <span className="text-xs opacity-70 px-1">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Message en cours de streaming */}
          {isLoading && (
            <div className="mb-6">
              <div className="flex gap-4 max-w-full">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  {streamingMessage ? (
                    // Affichage du texte en streaming avec markdown
                    <div className="rounded-2xl px-4 py-3 bg-muted/50 max-w-full">
                      <MarkdownContent content={streamingMessage} />
                    </div>
                  ) : (
                    // Indicateur de chargement initial
                    <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyse en cours...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Questions suggérées */}
          {messages.length === 1 && !isLoading && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground font-medium px-1">
                Questions suggérées :
              </p>
              <div className="grid gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left h-auto py-2 px-3 hover:bg-primary/5"
                    onClick={() => setInput(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Référence pour l'auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input fixe en bas */}
      <div className="border-t bg-background px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
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
      </div>
    </div>
  )
}
