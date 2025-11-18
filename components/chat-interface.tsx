"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2, Sparkles, Copy, Check, Mic, MicOff, Volume2, VolumeX, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Message, Deal, ActionItem } from "@/types"
import { VoiceSettings, VoiceMode, PendingAction } from "@/types/voice"
import { geminiClientService } from "@/lib/gemini-client"
import { conversationManager } from "@/lib/conversation-manager"
import { AIContentGenerator } from "@/lib/ai-content-generator"
import { voiceRecognitionService } from "@/lib/voice-recognition"
import { voiceConversationOrchestrator, ConversationState } from "@/lib/voice-conversation-orchestrator"
import { useVoice } from "@/hooks/use-voice"
import { useConversational } from "@/hooks/use-conversational"
import { IntentDetector } from "@/lib/intent-detector"
import { VoiceIndicator } from "@/components/voice-indicator"
import { DealProposalCard, ActionProposalCard } from "@/components/action-proposal-card"
import { TemplatesModal } from "@/components/templates-modal"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ChatInterfaceProps {
  businessContext?: any
  conversationId: string
  onConversationUpdate?: () => void
  disableAutoScroll?: boolean
}

// Composant pour afficher le markdown avec un style plus aéré
const MarkdownContent = ({ content }: { content: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className="prose prose-sm dark:prose-invert max-w-none
      prose-headings:font-bold prose-headings:text-foreground
      prose-h1:text-xl prose-h1:mt-6 prose-h1:mb-4
      prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-3
      prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
      prose-p:my-3 prose-p:leading-7 prose-p:text-foreground
      prose-strong:text-foreground prose-strong:font-semibold
      prose-ul:my-3 prose-ul:list-disc prose-ul:pl-4
      prose-ol:my-3 prose-ol:list-decimal prose-ol:pl-4
      prose-li:my-2 prose-li:text-foreground
      prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
      prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-4
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4
      prose-hr:my-6 prose-hr:border-border
      prose-table:border-collapse prose-table:w-full prose-table:my-4
      prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:bg-muted
      prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
      prose-a:text-primary prose-a:underline prose-a:underline-offset-2
      break-words"
  >
    {content}
  </ReactMarkdown>
)

export function ChatInterface({ businessContext, conversationId, onConversationUpdate, disableAutoScroll = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)

  // États pour les anciens modes (rétrocompatibilité)
  const [isListening, setIsListening] = useState(false)
  const [conversationMode, setConversationMode] = useState(false)
  const [conversationState, setConversationState] = useState<ConversationState>("idle")

  // Nouveaux états pour le système vocal
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    mode: 'disabled',
    wakeWord: 'Hey Agent',
    conversationalMode: true,
    autoSpeak: true,
    language: 'fr-FR',
    voiceSpeed: 1.0,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Hooks pour le nouveau système vocal
  const {
    voiceState,
    isListening: isVoiceListening,
    error: voiceHookError,
    startManualListening,
    stopListening,
    speak,
    startConversationListening,
    returnToWakeWordMode,
  } = useVoice(
    (transcript, isFinal) => {
      if (isFinal) {
        handleVoiceInput(transcript)
        setInterimTranscript("")
      } else {
        setInterimTranscript(transcript)
      }
    },
    voiceSettings
  )

  const {
    state: conversationalState,
    pendingAction,
    processMessage,
    createPendingItem,
    startConversation,
    endConversation,
    reset: resetConversation,
  } = useConversational(
    (deal) => {
      // Callback quand un deal est créé
      console.log('[Conversational] Deal créé:', deal)
      // TODO: Ajouter le deal à la base de données ou au contexte
    },
    (action) => {
      // Callback quand une action est créée
      console.log('[Conversational] Action créée:', action)
      // TODO: Ajouter l'action à la base de données ou au contexte
    }
  )

  // Fonction helper pour vérifier le support vocal
  const isVoiceSupported = () => {
    if (typeof window === 'undefined') return false
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    return !!SpeechRecognition
  }

  // Fonctions helper pour manipuler pendingAction
  const confirmPendingAction = async () => {
    return createPendingItem()
  }

  const cancelPendingAction = () => {
    resetConversation()
  }

  // Gérer l'entrée vocale
  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) return

    // Détecter l'intention du message
    const intent = IntentDetector.detectIntent(transcript, !!pendingAction)

    if (intent.intent === 'confirm' && pendingAction) {
      // Confirmer l'action en attente
      await handleConfirmPendingAction()
      return
    }

    if (intent.intent === 'cancel' && pendingAction) {
      // Annuler l'action en attente
      cancelPendingAction()
      if (voiceSettings.autoSpeak) {
        await speak("D'accord, j'annule.")
      }
      return
    }

    if (intent.intent === 'modify' && pendingAction) {
      // Modifier le deal/action en attente (à implémenter)
      if (voiceSettings.autoSpeak) {
        await speak("Modification enregistrée. Confirmez-vous ?")
      }
      return
    }

    // Traiter le message normalement
    const result = await processMessage(transcript)

    if (result.pendingAction) {
      // Une action est en attente de confirmation
      if (voiceSettings.autoSpeak && voiceSettings.mode === 'automatic') {
        await speak(result.pendingAction.confirmationMessage + ". Confirmez-vous ?")
      }
    } else if (result.response) {
      // Réponse de l'IA
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: transcript,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])

      // Envoyer à Gemini
      await handleSendMessage(transcript)
    }
  }

  // Confirmer une action en attente (deal ou action)
  const handleConfirmPendingAction = async () => {
    if (!pendingAction) return

    try {
      const createdItem = await confirmPendingAction()

      if (voiceSettings.autoSpeak) {
        if (pendingAction.type === 'create_deal') {
          await speak("Parfait ! L'opportunité a été créée avec succès.")
        } else {
          await speak("L'action a été créée avec succès.")
        }
      }

      // Ajouter un message de confirmation dans le chat
      const confirmMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: pendingAction.type === 'create_deal'
          ? `✅ Opportunité créée avec succès !`
          : `✅ Action créée avec succès !`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, confirmMsg])

    } catch (error) {
      console.error("Erreur création:", error)
      if (voiceSettings.autoSpeak) {
        await speak("Désolé, une erreur s'est produite lors de la création.")
      }
    }
  }

  // Charger les messages de la conversation active
  useEffect(() => {
    if (conversationId) {
      const conversation = conversationManager.getConversation(conversationId)
      if (conversation) {
        setMessages(conversation.messages)
      }
    }
  }, [conversationId])

  // Sauvegarder les messages à chaque changement
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      conversationManager.updateConversation(conversationId, messages)
      onConversationUpdate?.()
    }
  }, [messages, conversationId, onConversationUpdate])

  // Auto-scroll vers le bas quand il y a de nouveaux messages ou streaming
  useEffect(() => {
    if (!disableAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, streamingMessage, disableAutoScroll])

  // Configuration de la reconnaissance vocale simple
  useEffect(() => {
    // Callback pour les résultats de la reconnaissance
    voiceRecognitionService.onResult((transcript) => {
      // En mode simple (pas conversationnel)
      if (!conversationMode) {
        setInput(transcript)
        setVoiceError(null)
      }
    })

    // Callback pour les erreurs
    voiceRecognitionService.onError((error) => {
      if (!conversationMode) {
        setVoiceError(error)
        setTimeout(() => setVoiceError(null), 5000) // Effacer l'erreur après 5s
      }
    })

    // Callback pour les changements d'état
    voiceRecognitionService.onStateChange((listening) => {
      if (!conversationMode) {
        setIsListening(listening)
      }
    })
  }, [conversationMode])

  // Configuration du mode conversationnel vocal
  useEffect(() => {
    voiceConversationOrchestrator.setCallbacks({
      // Changement d'état de la conversation
      onStateChange: (state) => {
        setConversationState(state)
      },

      // Message utilisateur détecté
      onUserMessage: (message) => {
        const userMsg: Message = {
          id: Date.now().toString(),
          role: "user",
          content: message,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, userMsg])
      },

      // Obtenir la réponse de l'assistant
      onAssistantResponse: async (userMessage) => {
        setIsLoading(true)
        setStreamingMessage("")

        try {
          // Obtenir la réponse de Gemini avec streaming
          const response = await geminiClientService.chatStream(
            [
              ...messages.map((msg) => ({
                role: msg.role === "assistant" ? "model" as const : "user" as const,
                parts: msg.content,
              })),
              {
                role: "user" as const,
                parts: userMessage,
              },
            ],
            businessContext,
            (text) => {
              setStreamingMessage(text)
            }
          )

          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response || "Désolé, je n'ai pas pu générer de réponse.",
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, assistantMsg])
          setStreamingMessage("")
          setIsLoading(false)

          // Faire parler l'assistant
          await voiceConversationOrchestrator.speak(response)
        } catch (error: any) {
          console.error("Erreur conversation vocale:", error)
          setIsLoading(false)
          setStreamingMessage("")

          const errorMsg = "Désolé, une erreur s'est produite."
          const assistantMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: errorMsg,
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, assistantMsg])
          await voiceConversationOrchestrator.speak(errorMsg)
        }
      },

      // Erreur
      onError: (error) => {
        setVoiceError(error)
        setTimeout(() => setVoiceError(null), 5000)
      },

      // Commande vocale reçue
      onCommand: (command) => {
        if (command.type === "exit") {
          setConversationMode(false)
        }
      },
    })
  }, [messages, businessContext])

  // Gérer le bouton microphone simple
  const handleVoiceToggle = () => {
    if (isListening) {
      voiceRecognitionService.stop()
    } else {
      voiceRecognitionService.start()
    }
  }

  // Gérer le mode conversationnel
  const handleConversationModeToggle = () => {
    if (conversationMode) {
      // Arrêter le mode conversationnel
      voiceConversationOrchestrator.stop()
      setConversationMode(false)
      setConversationState("idle")
    } else {
      // Démarrer le mode conversationnel
      if (!voiceConversationOrchestrator.isSupported()) {
        setVoiceError("Votre navigateur ne supporte pas le mode conversationnel complet")
        return
      }
      setConversationMode(true)
      voiceConversationOrchestrator.start()
    }
  }

  // Obtenir le libellé de l'état conversationnel
  const getConversationStateLabel = (state: ConversationState): string => {
    switch (state) {
      case "idle":
        return "En attente"
      case "listening":
        return "🎤 Je vous écoute..."
      case "processing":
        return "🤔 Je réfléchis..."
      case "speaking":
        return "🔊 Je vous réponds..."
      default:
        return ""
    }
  }

  // Gérer l'application d'un template
  const handleTemplateApply = (content: string) => {
    // Ajouter le contenu du template comme message assistant
    const templateMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
      isGenerated: true,
    }
    setMessages((prev) => [...prev, templateMessage])
  }

  // Gérer les commandes slash (async avec Gemini)
  const handleSlashCommand = async (
    command: string,
    onChunk?: (text: string) => void
  ): Promise<string | null> => {
    const parts = command.trim().split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (cmd) {
      case "/help":
        return `**Commandes disponibles (générées par IA) :**

- \`/email [entreprise]\` - Générer un email de relance avec Gemini
- \`/proposition [entreprise]\` - Générer une proposition commerciale complète
- \`/briefing [entreprise]\` - Générer un briefing de réunion
- \`/script [contact] [entreprise]\` - Générer un script d'appel
- \`/summary\` - Générer un résumé quotidien
- \`/help\` - Afficher cette aide

**Exemples :**
- \`/email TechCorp\`
- \`/proposition Innovatech\`
- \`/briefing DataFlow\`
- \`/script Marie TechCorp\`
- \`/summary\`

✨ **Toutes les commandes utilisent Gemini AI pour un contenu ultra-personnalisé !**`

      case "/email":
        if (!businessContext?.topDeals || businessContext.topDeals.length === 0) {
          return "Aucun deal disponible pour générer un email."
        }
        // Si un nom d'entreprise est fourni, chercher le deal correspondant
        if (args.length > 0) {
          const company = args.join(" ")
          const deal = businessContext.topDeals.find((d: any) =>
            d.company.toLowerCase().includes(company.toLowerCase())
          )
          if (deal) {
            return await AIContentGenerator.generateFollowUpEmail(deal, onChunk)
          } else {
            return `Deal "${company}" non trouvé. Deals disponibles : ${businessContext.topDeals.map((d: any) => d.company).join(", ")}`
          }
        } else {
          // Prendre le premier deal actif
          const activeDeal = businessContext.topDeals.find((d: any) => d.stage !== "Gagné" && d.stage !== "Perdu")
          if (activeDeal) {
            return await AIContentGenerator.generateFollowUpEmail(activeDeal, onChunk)
          } else {
            return "Aucun deal actif disponible."
          }
        }

      case "/proposition":
        if (!businessContext?.topDeals || businessContext.topDeals.length === 0) {
          return "Aucun deal disponible pour générer une proposition."
        }
        if (args.length > 0) {
          const company = args.join(" ")
          const deal = businessContext.topDeals.find((d: any) =>
            d.company.toLowerCase().includes(company.toLowerCase())
          )
          if (deal) {
            return await AIContentGenerator.generateProposal(deal, businessContext, onChunk)
          } else {
            return `Deal "${company}" non trouvé. Deals disponibles : ${businessContext.topDeals.map((d: any) => d.company).join(", ")}`
          }
        } else {
          const activeDeal = businessContext.topDeals.find((d: any) =>
            d.stage === "Proposition" || d.stage === "Qualification"
          )
          if (activeDeal) {
            return await AIContentGenerator.generateProposal(activeDeal, businessContext, onChunk)
          } else {
            return "Aucun deal en phase de proposition disponible."
          }
        }

      case "/briefing":
        if (!businessContext?.topDeals || businessContext.topDeals.length === 0) {
          return "Aucun deal disponible pour générer un briefing."
        }
        if (args.length > 0) {
          const company = args.join(" ")
          const deal = businessContext.topDeals.find((d: any) =>
            d.company.toLowerCase().includes(company.toLowerCase())
          )
          if (deal) {
            return await AIContentGenerator.generateMeetingBriefing(deal, businessContext, onChunk)
          } else {
            return `Deal "${company}" non trouvé. Deals disponibles : ${businessContext.topDeals.map((d: any) => d.company).join(", ")}`
          }
        } else {
          const activeDeal = businessContext.topDeals[0]
          return await AIContentGenerator.generateMeetingBriefing(activeDeal, businessContext, onChunk)
        }

      case "/script":
        if (args.length < 2) {
          return "Usage: `/script [contact] [entreprise]`\nExemple: `/script Marie TechCorp`"
        }
        const contact = args[0]
        const company = args.slice(1).join(" ")
        return await AIContentGenerator.generateCallScript(contact, company, undefined, onChunk)

      case "/summary":
        if (!businessContext) {
          return "Contexte business non disponible."
        }
        return await AIContentGenerator.generateDailySummary(businessContext, onChunk)

      default:
        return null // Pas une commande slash reconnue
    }
  }

  // Fonction principale pour envoyer un message
  const handleSendMessage = async (textOverride?: string) => {
    const messageText = textOverride || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = messageText
    if (!textOverride) {
      setInput("")
    }

    // Vérifier si c'est une commande slash
    if (currentInput.startsWith("/")) {
      setIsLoading(true)
      setStreamingMessage("")

      try {
        const generatedContent = await handleSlashCommand(currentInput, (text) => {
          setStreamingMessage(text)
        })
        if (generatedContent) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: generatedContent,
            timestamp: new Date(),
            isGenerated: true, // Marquer comme contenu généré
          }
          setMessages((prev) => [...prev, assistantMessage])
          setStreamingMessage("")
          setIsLoading(false)
          return
        }
        // Si la commande n'est pas reconnue, afficher un message d'aide
        const helpMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Commande non reconnue. Tapez \`/help\` pour voir les commandes disponibles.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, helpMessage])
        setStreamingMessage("")
        setIsLoading(false)
        return
      } catch (error) {
        console.error("Erreur commande slash:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Erreur lors de la génération du contenu. Vérifiez votre clé API Gemini.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        setStreamingMessage("")
        setIsLoading(false)
        return
      }
    }

    // Vérifier que la clé API est configurée pour les requêtes normales
    if (!geminiClientService.hasApiKey()) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Veuillez configurer votre clé API Gemini en cliquant sur le bouton en haut à droite de l'écran.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

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

  // Wrapper pour le bouton d'envoi
  const handleSend = () => {
    handleSendMessage()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Fonction pour auto-envoyer les questions suggérées
  const handleSuggestedClick = (question: string) => {
    setInput(question)
    // Envoyer automatiquement après un court délai pour que l'utilisateur voie la question
    setTimeout(() => {
      if (geminiClientService.hasApiKey() && question.trim() && !isLoading) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: question,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)
        setStreamingMessage("")

        geminiClientService
          .chatStream(
            [...messages, userMessage].map((m) => ({
              role: m.role === "user" ? "user" : "model",
              parts: m.content,
            })),
            businessContext,
            (text) => {
              setStreamingMessage(text)
            }
          )
          .then((finalResponse) => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: finalResponse || "Désolé, je n'ai pas pu générer de réponse.",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setStreamingMessage("")
          })
          .catch((error: any) => {
            console.error("Chat error:", error)
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: error.message || "Désolé, une erreur s'est produite. Veuillez réessayer.",
              timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
            setStreamingMessage("")
          })
          .finally(() => {
            setIsLoading(false)
          })
      }
    }, 100)
  }

  const suggestedQuestions = [
    "Quelles sont mes opportunités prioritaires ?",
    "Comment améliorer mon taux de conversion ?",
    "/help",
    "Prépare-moi pour mon RDV avec TechCorp",
  ]

  // Gérer le changement de mode vocal
  const handleVoiceModeChange = (mode: VoiceMode) => {
    setVoiceSettings((prev) => ({ ...prev, mode }))

    if (mode === 'automatic') {
      startConversation()
      startConversationListening()
    } else if (mode === 'manual') {
      // Manuel : pas de wake word, on attend que l'utilisateur clique
      stopListening()
      endConversation()
    } else {
      // Disabled
      stopListening()
      endConversation()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header fixe en haut */}
      <div className="border-b bg-background px-6 py-4 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Copilote Commercial IA</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Boutons de contrôle vocal */}
            {isVoiceSupported() && (
              <>
                {/* Mode automatique (wake word) */}
                <Button
                  onClick={() => handleVoiceModeChange(voiceSettings.mode === 'automatic' ? 'disabled' : 'automatic')}
                  size="sm"
                  variant={voiceSettings.mode === 'automatic' ? "default" : "outline"}
                  className={cn(
                    "gap-2",
                    voiceSettings.mode === 'automatic' && "bg-gradient-to-r from-purple-600 to-blue-600"
                  )}
                >
                  {voiceSettings.mode === 'automatic' ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Wake Word ON
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Hey Agent
                    </>
                  )}
                </Button>

                {/* Mode manuel */}
                <Button
                  onClick={() => handleVoiceModeChange(voiceSettings.mode === 'manual' ? 'disabled' : 'manual')}
                  size="sm"
                  variant={voiceSettings.mode === 'manual' ? "default" : "outline"}
                  className="gap-2"
                >
                  <Mic className="h-4 w-4" />
                  Manuel
                </Button>

                {/* Paramètres vocaux */}
                <Button
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  size="sm"
                  variant="ghost"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}
            <TemplatesModal onTemplateApply={handleTemplateApply} />
          </div>
        </div>

        {/* Indicateur vocal */}
        {voiceSettings.mode !== 'disabled' && (
          <div className="mt-3 pt-3 border-t">
            <VoiceIndicator
              state={voiceState}
              interimTranscript={interimTranscript}
              wakeWord={voiceSettings.wakeWord}
            />
          </div>
        )}

        {/* Indicateur d'état conversationnel */}
        {conversationMode && (
          <div className="mt-3 pt-3 border-t">
            <div className={cn(
              "flex items-center gap-2 text-sm px-3 py-2 rounded-lg",
              conversationState === "listening" && "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
              conversationState === "processing" && "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400",
              conversationState === "speaking" && "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400",
              conversationState === "idle" && "bg-muted text-muted-foreground"
            )}>
              {conversationState === "listening" && <Mic className="h-4 w-4 animate-pulse" />}
              {conversationState === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
              {conversationState === "speaking" && <Volume2 className="h-4 w-4 animate-pulse" />}
              <span className="font-medium">{getConversationStateLabel(conversationState)}</span>
              {conversationState !== "idle" && (
                <div className="ml-auto flex gap-1">
                  <div className="w-1 h-4 bg-current rounded animate-pulse" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-4 bg-current rounded animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-4 bg-current rounded animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        )}
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
                  <div className="relative group">
                    {message.isGenerated && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-1 rounded-full">
                          ✨ Contenu généré
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(message.content, message.id)}
                          className="h-6 text-xs gap-1"
                        >
                          {copiedId === message.id ? (
                            <>
                              <Check className="h-3 w-3" />
                              Copié
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copier
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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

          {/* Cartes de proposition (deals/actions) */}
          {pendingAction && (
            <div className="mb-6">
              {pendingAction.type === 'create_deal' ? (
                <DealProposalCard
                  deal={pendingAction.data}
                  onConfirm={handleConfirmPendingAction}
                  onCancel={() => {
                    cancelPendingAction()
                    if (voiceSettings.autoSpeak) {
                      speak("D'accord, annulé.")
                    }
                  }}
                />
              ) : (
                <ActionProposalCard
                  action={pendingAction.data}
                  onConfirm={handleConfirmPendingAction}
                  onCancel={() => {
                    cancelPendingAction()
                    if (voiceSettings.autoSpeak) {
                      speak("D'accord, annulé.")
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Questions suggérées - Auto-envoi au clic */}
          {messages.length === 1 && !isLoading && !pendingAction && (
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
                    onClick={() => handleSuggestedClick(question)}
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
        <div className="max-w-3xl mx-auto">
          {/* Affichage des erreurs vocales */}
          {voiceError && (
            <div className="mb-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <p className="text-xs text-red-600 dark:text-red-400">{voiceError}</p>
            </div>
          )}

          {/* Indicateur d'écoute (mode simple uniquement) */}
          {isListening && !conversationMode && (
            <div className="mb-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 animate-pulse">
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Mic className="h-3 w-3" />
                Écoute en cours... Parlez maintenant
              </p>
            </div>
          )}

          {/* Message en mode conversationnel */}
          {conversationMode && (
            <div className="mb-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900">
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Volume2 className="h-3 w-3 animate-pulse" />
                Mode vocal actif - Utilisez votre voix pour interagir. Dites "aide" pour les commandes disponibles.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={conversationMode ? "Mode vocal actif - Parlez directement..." : "Posez votre question ou tapez / pour les commandes..."}
              disabled={isLoading || conversationMode}
              className="flex-1"
            />
            {/* Bouton microphone simple (désactivé en mode conversationnel) */}
            {voiceRecognitionService.isSupported() && !conversationMode && (
              <Button
                onClick={handleVoiceToggle}
                disabled={isLoading}
                size="icon"
                variant={isListening ? "destructive" : "outline"}
                className={cn(
                  isListening && "animate-pulse"
                )}
              >
                {isListening ? (
                  <MicOff className="size-4" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>
            )}
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || conversationMode}
              size="icon"
            >
              <Send className="size-4" />
            </Button>
          </div>
          {input.startsWith("/") && input.length > 1 && (
            <div className="mt-2 text-xs text-muted-foreground">
              💡 Tapez /help pour voir toutes les commandes disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
