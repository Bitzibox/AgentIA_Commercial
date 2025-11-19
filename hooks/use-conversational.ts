"use client"

import { useState, useCallback } from 'react'
import { ConversationalState, PendingAction } from '@/types/voice'
import { IntentDetector } from '@/lib/intent-detector'
import { EntityExtractor } from '@/lib/entity-extractor'
import { ItemMatcher } from '@/lib/item-matcher'
import { Deal, ActionItem } from '@/types'

export function useConversational(
  onDealCreated: (deal: Deal) => void,
  onActionCreated: (action: ActionItem) => void,
  onDealUpdated?: (id: string, updates: Partial<Deal>) => void,
  onActionUpdated?: (id: string, updates: Partial<ActionItem>) => void,
  existingDeals?: Deal[],
  existingActions?: ActionItem[]
) {
  const [state, setState] = useState<ConversationalState>({
    isActive: false,
    context: {},
    itemsCreated: {
      deals: [],
      actions: [],
    },
    currentStep: 'greeting',
  })

  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  // Démarrer une conversation
  const startConversation = useCallback(() => {
    setState({
      isActive: true,
      context: {},
      itemsCreated: { deals: [], actions: [] },
      currentStep: 'greeting',
      conversationStartTime: new Date(),
      lastInteractionTime: new Date(),
    })
  }, [])

  // Terminer une conversation
  const endConversation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentStep: 'completed',
    }))
    setPendingAction(null)
  }, [])

  // Traiter un message utilisateur
  const processMessage = useCallback(
    (message: string) => {
      setState((prev) => ({
        ...prev,
        lastInteractionTime: new Date(),
      }))

      // Si on attend une confirmation
      if (pendingAction?.awaitingConfirmation) {
        const intent = IntentDetector.detectIntent(message, true)

        if (intent.intent === 'confirm') {
          return {
            shouldCreate: true,
            pendingAction,
            response: null,
          }
        } else if (intent.intent === 'cancel') {
          setPendingAction(null)
          return {
            shouldCreate: false,
            pendingAction: null,
            response: "D'accord, j'annule cette action.",
          }
        } else if (intent.intent === 'modify') {
          // Mettre à jour avec les modifications
          const updated = { ...pendingAction }
          if (updated.type === 'create_deal') {
            updated.data = EntityExtractor.updateDealWithModifications(updated.data, intent.entities)
            updated.confirmationMessage = EntityExtractor.generateDealConfirmation(updated.data)
          } else if (updated.type === 'create_action') {
            updated.data = EntityExtractor.updateActionWithModifications(updated.data, intent.entities)
            updated.confirmationMessage = EntityExtractor.generateActionConfirmation(updated.data)
          }

          setPendingAction(updated)
          return {
            shouldCreate: false,
            pendingAction: updated,
            response: `D'accord, ${updated.confirmationMessage}. Je crée cette ${updated.type === 'create_deal' ? 'opportunité' : 'action'} ?`,
          }
        }
      }

      // Détecter l'intention
      const intent = IntentDetector.detectIntent(message, false)

      if (intent.intent === 'create_deal') {
        const deal = EntityExtractor.createDealFromEntities(intent.entities)
        const confirmation = EntityExtractor.generateDealConfirmation(deal)

        const newPending: PendingAction = {
          type: 'create_deal',
          data: deal,
          confirmationMessage: confirmation,
          confidence: intent.confidence,
          awaitingConfirmation: true,
        }

        setPendingAction(newPending)

        return {
          shouldCreate: false,
          pendingAction: newPending,
          response: `${confirmation}. Dois-je créer cette opportunité ?`,
        }
      } else if (intent.intent === 'create_action') {
        const action = EntityExtractor.createActionFromEntities(intent.entities)
        const confirmation = EntityExtractor.generateActionConfirmation(action)

        const newPending: PendingAction = {
          type: 'create_action',
          data: action,
          confirmationMessage: confirmation,
          confidence: intent.confidence,
          awaitingConfirmation: true,
        }

        setPendingAction(newPending)

        return {
          shouldCreate: false,
          pendingAction: newPending,
          response: `${confirmation}. Je la crée ?`,
        }
      } else if (intent.intent === 'update_deal') {
        // Trouver l'opportunité à modifier
        if (!existingDeals || existingDeals.length === 0) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: "Je n'ai trouvé aucune opportunité à modifier.",
          }
        }

        const targetIdentifier = intent.targetIdentifier
        if (!targetIdentifier) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: "Je n'ai pas compris quelle opportunité vous souhaitez modifier. Pouvez-vous préciser le nom du client ?",
          }
        }

        const matchResult = ItemMatcher.findDeal(existingDeals, targetIdentifier)
        if (!matchResult) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: `Je n'ai pas trouvé d'opportunité correspondant à "${targetIdentifier}". Pouvez-vous préciser ?`,
          }
        }

        const targetDeal = matchResult.item
        const updates = intent.entities
        const confirmation = EntityExtractor.generateDealUpdateConfirmation(targetDeal, updates)

        const newPending: PendingAction = {
          type: 'update_deal',
          data: updates,
          targetItemId: targetDeal.id,
          confirmationMessage: confirmation,
          confidence: matchResult.confidence,
          awaitingConfirmation: true,
        }

        setPendingAction(newPending)

        return {
          shouldCreate: false,
          pendingAction: newPending,
          response: `${confirmation}. Je valide cette modification ?`,
        }
      } else if (intent.intent === 'update_action') {
        // Trouver l'action à modifier
        if (!existingActions || existingActions.length === 0) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: "Je n'ai trouvé aucune action à modifier.",
          }
        }

        const targetIdentifier = intent.targetIdentifier
        if (!targetIdentifier) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: "Je n'ai pas compris quelle action vous souhaitez modifier. Pouvez-vous préciser ?",
          }
        }

        const matchResult = ItemMatcher.findAction(existingActions, targetIdentifier)
        if (!matchResult) {
          return {
            shouldCreate: false,
            pendingAction: null,
            response: `Je n'ai pas trouvé d'action correspondant à "${targetIdentifier}". Pouvez-vous préciser ?`,
          }
        }

        const targetAction = matchResult.item
        const updates = intent.entities
        const confirmation = EntityExtractor.generateActionUpdateConfirmation(targetAction, updates)

        const newPending: PendingAction = {
          type: 'update_action',
          data: updates,
          targetItemId: targetAction.id,
          confirmationMessage: confirmation,
          confidence: matchResult.confidence,
          awaitingConfirmation: true,
        }

        setPendingAction(newPending)

        return {
          shouldCreate: false,
          pendingAction: newPending,
          response: `${confirmation}. Je valide cette modification ?`,
        }
      }

      // Pas d'intention spéciale détectée
      return {
        shouldCreate: false,
        pendingAction: null,
        response: null, // L'IA répondra normalement
      }
    },
    [pendingAction, existingDeals, existingActions, onDealUpdated, onActionUpdated]
  )

  // Créer l'item en attente
  const createPendingItem = useCallback(() => {
    if (!pendingAction) return false

    if (pendingAction.type === 'create_deal') {
      const deal: Deal = {
        id: Date.now().toString(),
        ...pendingAction.data,
      }

      onDealCreated(deal)

      setState((prev) => ({
        ...prev,
        itemsCreated: {
          ...prev.itemsCreated,
          deals: [...prev.itemsCreated.deals, deal.id],
        },
      }))
    } else if (pendingAction.type === 'create_action') {
      const action: ActionItem = {
        id: Date.now().toString(),
        ...pendingAction.data,
      }

      onActionCreated(action)

      setState((prev) => ({
        ...prev,
        itemsCreated: {
          ...prev.itemsCreated,
          actions: [...prev.itemsCreated.actions, action.id],
        },
      }))
    } else if (pendingAction.type === 'update_deal') {
      if (!pendingAction.targetItemId || !onDealUpdated) return false

      onDealUpdated(pendingAction.targetItemId, pendingAction.data)

      // Pas besoin de mettre à jour itemsCreated pour les modifications
    } else if (pendingAction.type === 'update_action') {
      if (!pendingAction.targetItemId || !onActionUpdated) return false

      onActionUpdated(pendingAction.targetItemId, pendingAction.data)

      // Pas besoin de mettre à jour itemsCreated pour les modifications
    }

    setPendingAction(null)
    return true
  }, [pendingAction, onDealCreated, onActionCreated, onDealUpdated, onActionUpdated])

  // Réinitialiser
  const reset = useCallback(() => {
    setState({
      isActive: false,
      context: {},
      itemsCreated: { deals: [], actions: [] },
    })
    setPendingAction(null)
  }, [])

  return {
    state,
    pendingAction,
    startConversation,
    endConversation,
    processMessage,
    createPendingItem,
    reset,
  }
}
