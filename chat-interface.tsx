"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your commercial co-pilot. I can help you with sales insights, customer analysis, and business intelligence. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // <CHANGE> Call the AI API endpoint
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
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message.content,
        timestamp: new Date(),
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
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
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Commercial Co-pilot</h1>
          <p className="text-sm text-muted-foreground">Your AI-powered business assistant</p>
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
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-50">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: "2-digit", 
                   
