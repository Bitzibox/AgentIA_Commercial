"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Send, Bot, User, Loader2, X, TrendingUp, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Deal, BusinessContext, Message } from "@/types"
import { geminiClientService } from "@/lib/gemini-client"
import { AIContentGenerator } from "@/lib/ai-content-generator"
import { AIInsightsEngine } from "@/lib/ai-insights"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface DealCopilotProps {
  deal: Deal
  businessContext: BusinessContext
  trigger?: React.ReactNode
}

// Composant pour afficher le markdown
const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className="prose prose-sm dark:prose-invert max-w-none
      prose-p:my-2 prose-p:leading-7
      prose-strong:font-semibold
      prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
      prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
      prose-li:my-1
      prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      break-words"
  >
    {content}
  </ReactMarkdown>
)

export function DealCopilot({ deal, businessContext, trigger }: DealCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingMessage])

  // Initialiser avec un message de bienvenue contextuel
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const analysis = AIInsightsEngine.analyzeDeal(deal, businessContext.topDeals)
      const welcomeMessage: Message = {
        id: "welcome",
        role: "assistant",
        content: `👋 Bonjour ! Je suis votre copilote IA pour l'opportunité **${deal.company}**.

**Contexte actuel :**
- **Phase :** ${deal.stage}
- **Valeur :** ${deal.value.toLocaleString('fr-FR')} €
- **Probabilité :** ${deal.probability}%
- **Contact :** ${deal.contact}
${deal.nextStep ? `- **Prochaine étape :** ${deal.nextStep}` : ''}

**Mon analyse :**
- **Probabilité ajustée :** ${analysis.closingProbability}%
- **Temps estimé :** ${analysis.estimatedDays} jours
- **Niveau de risque :** ${analysis.riskLevel === 'high' ? '🔴 Élevé' : analysis.riskLevel === 'medium' ? '🟡 Moyen' : '🟢 Faible'}

💡 **Recommandation :** ${analysis.recommendation}

**Comment puis-je vous aider ?**
- Préparer votre prochaine réunion
- Rédiger un email de relance
- Élaborer une stratégie de négociation
- Analyser les risques et opportunités
- Générer une proposition commerciale

Posez-moi vos questions !`,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen, deal, businessContext])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    if (!geminiClientService.hasApiKey()) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Veuillez configurer votre clé API Gemini.",
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
      // Créer un contexte enrichi spécifique au deal
      const dealContext = {
        ...businessContext,
        currentDeal: deal,
        dealAnalysis: AIInsightsEngine.analyzeDeal(deal, businessContext.topDeals),
        systemPrompt: `Tu es un assistant commercial expert spécialisé dans ce deal spécifique.

DEAL EN FOCUS:
- Entreprise: ${deal.company}
- Contact: ${deal.contact}
- Valeur: ${deal.value.toLocaleString('fr-FR')} €
- Phase: ${deal.stage}
- Probabilité: ${deal.probability}%
${deal.nextStep ? `- Prochaine étape: ${deal.nextStep}` : ''}
${deal.tags ? `- Tags: ${deal.tags.join(', ')}` : ''}

Tu dois fournir des conseils ultra-personnalisés pour ce deal précis. Utilise les données du contexte business global mais reste toujours focalisé sur ce deal.`
      }

      const finalResponse = await geminiClientService.chatStream(
        [...messages, userMessage].map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: m.content,
        })),
        dealContext,
        (text) => {
          setStreamingMessage(text)
        }
      )

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
        content: error.message || "Désolé, une erreur s'est produite.",
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

  const quickActions = [
    {
      label: "📧 Email de relance",
      action: async () => {
        setIsLoading(true)
        setStreamingMessage("")
        try {
          const email = await AIContentGenerator.generateFollowUpEmail(deal, (text) => {
            setStreamingMessage(text)
          })
          const msg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: email,
            timestamp: new Date(),
            isGenerated: true,
          }
          setMessages((prev) => [...prev, msg])
        } catch (error) {
          console.error("Erreur génération email:", error)
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Erreur lors de la génération de l'email. Vérifiez votre clé API Gemini.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMsg])
        } finally {
          setStreamingMessage("")
          setIsLoading(false)
        }
      },
    },
    {
      label: "📄 Proposition",
      action: async () => {
        setIsLoading(true)
        setStreamingMessage("")
        try {
          const proposal = await AIContentGenerator.generateProposal(deal, businessContext, (text) => {
            setStreamingMessage(text)
          })
          const msg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: proposal,
            timestamp: new Date(),
            isGenerated: true,
          }
          setMessages((prev) => [...prev, msg])
        } catch (error) {
          console.error("Erreur génération proposition:", error)
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Erreur lors de la génération de la proposition. Vérifiez votre clé API Gemini.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMsg])
        } finally {
          setStreamingMessage("")
          setIsLoading(false)
        }
      },
    },
    {
      label: "📋 Briefing réunion",
      action: async () => {
        setIsLoading(true)
        setStreamingMessage("")
        try {
          const briefing = await AIContentGenerator.generateMeetingBriefing(deal, businessContext, (text) => {
            setStreamingMessage(text)
          })
          const msg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: briefing,
            timestamp: new Date(),
            isGenerated: true,
          }
          setMessages((prev) => [...prev, msg])
        } catch (error) {
          console.error("Erreur génération briefing:", error)
          const errorMsg: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "Erreur lors de la génération du briefing. Vérifiez votre clé API Gemini.",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMsg])
        } finally {
          setStreamingMessage("")
          setIsLoading(false)
        }
      },
    },
  ]

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="gap-2 hover:bg-purple-50 dark:hover:bg-purple-950"
    >
      <MessageSquare className="h-3 w-3" />
      Copilote IA
    </Button>
  )

  if (!isOpen) {
    return <div onClick={() => setIsOpen(true)}>{trigger || defaultTrigger}</div>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-3xl w-full h-[80vh] flex flex-col">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Copilote IA - {deal.company}
                </CardTitle>
                <CardDescription>
                  Assistant IA dédié à cette opportunité
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="text-xs h-7"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Messages */}
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === "assistant"
                        ? "bg-purple-600 text-white"
                        : "bg-secondary"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <Bot className="size-4" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  {message.isGenerated && (
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-full">
                      ✨ Contenu généré
                    </span>
                  )}
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2",
                      message.role === "assistant"
                        ? "bg-muted/50"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <MarkdownContent content={message.content} />
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* Message en streaming */}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-purple-600 text-white">
                    <Bot className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  {streamingMessage ? (
                    <div className="rounded-xl px-3 py-2 bg-muted/50">
                      <MarkdownContent content={streamingMessage} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Analyse en cours...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Input */}
        <div className="border-t p-4 shrink-0">
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
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
