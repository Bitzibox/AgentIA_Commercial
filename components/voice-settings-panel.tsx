"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Mic, MicOff, MessageSquare, Volume2, Zap } from 'lucide-react'
import { VoiceSettings } from '@/types/voice'

interface VoiceSettingsPanelProps {
  settings: VoiceSettings
  onChange: (settings: VoiceSettings) => void
}

export function VoiceSettingsPanel({ settings, onChange }: VoiceSettingsPanelProps) {
  return (
    <Card className="border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Paramètres Vocaux
        </CardTitle>
        <CardDescription>
          Configurez l'assistant vocal et le mode conversationnel
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Mode vocal */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Mode Vocal</Label>
          <RadioGroup
            value={settings.mode}
            onValueChange={(value: string) => onChange({ ...settings, mode: value as any })}
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="disabled" id="disabled" className="mt-1" />
              <Label htmlFor="disabled" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <MicOff className="h-4 w-4" />
                  Désactivé
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pas d'interaction vocale
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border-2 border-transparent data-[state=checked]:border-purple-300">
              <RadioGroupItem value="automatic" id="automatic" className="mt-1" />
              <Label htmlFor="automatic" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <Zap className="h-4 w-4 text-purple-600" />
                  Automatique (Wake Word)
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Activez l'assistant en disant <strong>"{settings.wakeWord}"</strong>
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  ⚡ Recommandé pour une expérience mains-libres
                </p>
              </Label>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="manual" id="manual" className="mt-1" />
              <Label htmlFor="manual" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2 font-medium">
                  <Mic className="h-4 w-4 text-blue-600" />
                  Manuel (Bouton)
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Maintenez le bouton pour parler
                </p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Wake word info */}
        {settings.mode === 'automatic' && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold">
              <Zap className="h-4 w-4" />
              Mot-clé d'activation
            </div>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Dites <strong>"{settings.wakeWord}"</strong> pour activer l'assistant vocal.
              Il vous écoutera jusqu'à la fin de votre demande.
            </p>
            <p className="text-xs text-muted-foreground">
              Variantes acceptées : "Hey Agent", "Hé Agent", "Agent"
            </p>
          </div>
        )}

        <div className="border-t pt-6 space-y-6">
          {/* Mode conversationnel */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mode Conversationnel
              </Label>
              <p className="text-sm text-muted-foreground">
                L'IA vous guide avec des questions pour créer des opportunités et actions
              </p>
            </div>
            <Switch
              checked={settings.conversationalMode}
              onCheckedChange={(checked: boolean) => onChange({ ...settings, conversationalMode: checked })}
            />
          </div>

          {/* Réponse vocale automatique */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Réponses vocales
              </Label>
              <p className="text-sm text-muted-foreground">
                L'IA parle ses réponses à voix haute
              </p>
            </div>
            <Switch
              checked={settings.autoSpeak}
              onCheckedChange={(checked: boolean) => onChange({ ...settings, autoSpeak: checked })}
            />
          </div>

          {/* Vitesse de la voix */}
          {settings.autoSpeak && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Vitesse de la voix : {settings.voiceSpeed.toFixed(1)}x
              </Label>
              <Slider
                value={[settings.voiceSpeed]}
                onValueChange={([value]: number[]) => onChange({ ...settings, voiceSpeed: value })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lent (0.5x)</span>
                <span>Normal (1.0x)</span>
                <span>Rapide (2.0x)</span>
              </div>
            </div>
          )}
        </div>

        {/* Info mode conversationnel */}
        {settings.conversationalMode && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comment ça fonctionne ?
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>✓ L'IA pose des questions pour compléter les informations</li>
              <li>✓ Confirmez vocalement ("oui") ou par écrit (bouton)</li>
              <li>✓ Modifiez facilement en reformulant votre demande</li>
              <li>✓ Créez plusieurs items dans une seule conversation</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
