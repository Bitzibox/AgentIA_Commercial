"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, X, ExternalLink, CheckCircle2 } from "lucide-react"
import { geminiClientService } from "@/lib/gemini-client"

interface ApiKeyDialogProps {
  onClose?: () => void
}

export function ApiKeyDialog({ onClose }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const hasKey = geminiClientService.hasApiKey()
    setIsConfigured(hasKey)
    if (!hasKey) {
      setShowDialog(true)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      geminiClientService.setApiKey(apiKey.trim())
      setIsConfigured(true)
      setShowDialog(false)
      if (onClose) onClose()
    }
  }

  const handleClear = () => {
    geminiClientService.clearApiKey()
    setApiKey("")
    setIsConfigured(false)
    setShowDialog(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  if (isConfigured && !showDialog) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="gap-2"
        >
          <Key className="h-4 w-4 text-green-600" />
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          Clé API configurée
        </Button>
      </div>
    )
  }

  if (!showDialog) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>Configuration Gemini</CardTitle>
            </div>
            {isConfigured && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            Entrez votre clé API Google Gemini pour activer l&apos;IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Votre clé API est stockée localement dans votre navigateur et n&apos;est jamais envoyée à nos serveurs.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1" disabled={!apiKey.trim()}>
              Enregistrer
            </Button>
            {isConfigured && (
              <Button variant="destructive" onClick={handleClear}>
                Supprimer
              </Button>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <p className="text-sm font-medium">Comment obtenir une clé API ?</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Visitez Google AI Studio</li>
              <li>Créez ou sélectionnez un projet</li>
              <li>Générez une clé API</li>
              <li>Copiez et collez la clé ci-dessus</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto gap-1"
              onClick={() => window.open("https://makersuite.google.com/app/apikey", "_blank")}
            >
              <ExternalLink className="h-3 w-3" />
              Obtenir une clé API gratuite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
