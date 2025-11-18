"use client"

import { VoiceState } from '@/types/voice'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceIndicatorProps {
  state: VoiceState
  interimTranscript?: string
  wakeWord?: string
}

export function VoiceIndicator({ state, interimTranscript, wakeWord = "Hey Agent" }: VoiceIndicatorProps) {
  if (state === 'idle') {
    return null
  }

  const stateConfig = {
    'listening-wake-word': {
      icon: <Mic className="h-5 w-5 animate-pulse" />,
      text: `En veille - Dites "${wakeWord}"`,
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
      borderColor: 'border-yellow-300 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      dotColor: 'bg-yellow-500',
    },
    active: {
      icon: <Mic className="h-5 w-5" />,
      text: interimTranscript || 'Je vous écoute...',
      bgColor: 'bg-green-100 dark:bg-green-950',
      borderColor: 'border-green-300 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
      dotColor: 'bg-green-500',
    },
    speaking: {
      icon: <Volume2 className="h-5 w-5 animate-pulse" />,
      text: 'Je parle...',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      borderColor: 'border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
      dotColor: 'bg-blue-500',
    },
  }

  const config = stateConfig[state] || stateConfig.idle

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border-2 animate-in slide-in-from-top duration-300',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="relative">
        <div className={cn('h-3 w-3 rounded-full animate-ping absolute', config.dotColor, 'opacity-75')} />
        <div className={cn('h-3 w-3 rounded-full', config.dotColor)} />
      </div>

      <div className={cn('flex items-center gap-2', config.textColor)}>
        {config.icon}
        <span className="font-medium">{config.text}</span>
      </div>
    </div>
  )
}

interface ConversationSummaryProps {
  dealsCreated: number
  actionsCreated: number
  onClose: () => void
}

export function ConversationSummary({ dealsCreated, actionsCreated, onClose }: ConversationSummaryProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-300 dark:border-green-700 rounded-lg p-6 animate-in slide-in-from-bottom duration-300">
      <div className="text-center space-y-4">
        <div className="text-4xl">✅</div>
        <h3 className="text-lg font-bold text-green-800 dark:text-green-200">
          Conversation terminée !
        </h3>

        <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
          {dealsCreated > 0 && (
            <p className="font-medium">
              🎯 {dealsCreated} opportunité{dealsCreated > 1 ? 's' : ''} créée{dealsCreated > 1 ? 's' : ''}
            </p>
          )}
          {actionsCreated > 0 && (
            <p className="font-medium">
              ✓ {actionsCreated} action{actionsCreated > 1 ? 's' : ''} créée{actionsCreated > 1 ? 's' : ''}
            </p>
          )}
          {dealsCreated === 0 && actionsCreated === 0 && (
            <p className="text-muted-foreground">Aucun élément créé</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  )
}
