"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
      content: "Bonjour ! Je suis votre **copilote commercial IA**. Je peux vous aider à analyser vos ventes, prioriser vos opportunités, préparer vos rendez-vous clients et bien plus. Comment puis-je vous assister aujourd'hui ?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    // Vérifier que la clé API est configurée
    if (!geminiClientService.hasApiKey()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "⚠️ Veuillez configurer votre clé API Gemini en cliquant sur le bouton en haut à droite de l'écran.",
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
        content: `❌ **Erreur** : ${error.message || "Désolé, une erreur s'est produite. Veuillez réessayer."}`,
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

  // Composant pour le rendu markdown
  const MarkdownMessage = ({ content }: { content: string }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl font-bold mt-3 mb-2 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg font-bold mt-3 mb-2 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-bold mt-2 mb-1 first:mt-0" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-0.5 my-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-0.5 my-1" {...props} />
          ),
          p: ({ node, ...props }) => <p className="my-1 leading-relaxed" {...props} />,
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2 rounded border">
              <table className="min-w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border px-3 py-2 font-bold text-left text-sm" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border px-3 py-2 text-sm" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
            ) : (
              <code className="block bg-muted/50 p-3 rounded my-2 text-sm font-mono overflow-x-auto" {...props} />
            ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )

  return (
    <Card className="flex flex-col h-full shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">Copilote Commercial IA</div>
            <div className="text-sm font-normal text-muted-foreground">
              Propulsé par Gemini Flash
            </div>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-6 max-w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      message.role === "assistant"
                        ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
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

                <div
                  className={cn(
                    "flex max-w-[85%] flex-col gap-2 rounded-xl px-4 py-3 overflow-hidden",
                    message.role === "assistant"
                      ? "bg-muted border"
                      : "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                  )}
                >
                  {message.role === "assistant" ? (
                    <MarkdownMessage content={message.content} />
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Message en streaming */}
            {isLoading && streamingMessage && (
              <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex max-w-[85%] flex-col gap-2 rounded-xl border bg-muted px-4 py-3 overflow-hidden">
                  <MarkdownMessage content={streamingMessage} />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Génération en cours...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Indicateur de chargement initial */}
            {isLoading && !streamingMessage && (
              <div className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-xl border bg-muted px-4 py-3">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Analyse en cours...
                  </span>
                </div>
              </div>
            )}

            {/* Questions suggérées */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <p className="text-sm text-muted-foreground font-medium">
                  💡 Questions suggérées :
                </p>
                <div className="grid gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto py-2 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950"
                      onClick={() => setInput(question)}
                    >
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/50 dark:to-purple-950/50">
          <div className="flex gap-2">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
