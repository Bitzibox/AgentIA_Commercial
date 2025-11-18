# 🎙️ Fonctionnalités Vocales et Mode Conversationnel

Ce document décrit les nouvelles fonctionnalités vocales et le mode conversationnel implémentées dans l'application.

## 📋 Résumé des changements

### 1. Tableau de bord simplifié
- ✅ Suppression des listes complètes d'opportunités et d'actions du dashboard
- ✅ Remplacement par des cartes résumées avec navigation vers les onglets dédiés
- ✅ Focus sur les métriques et insights IA

### 2. Système vocal avancé avec Wake Word
- ✅ Trois modes vocaux : Désactivé, Automatique (Wake Word), Manuel (Bouton)
- ✅ Détection du mot-clé "Hey Agent" pour activation mains-libres
- ✅ Reconnaissance vocale continue avec détection des pauses
- ✅ Synthèse vocale pour les réponses de l'IA
- ✅ Gestion des états : veille, actif, en parle

### 3. Mode conversationnel intelligent
- ✅ L'IA guide l'utilisateur avec des questions
- ✅ Détection automatique des intentions (créer opportunité/action)
- ✅ Extraction des entités (client, montant, date, priorité, etc.)
- ✅ Confirmation vocale ("oui/non") en mode vocal
- ✅ Cartes interactives en mode écrit
- ✅ Support des modifications en cours de conversation

### 4. Création d'opportunités et actions par IA
- ✅ Détection d'intention avancée avec patterns regex
- ✅ Extraction automatique des données du message
- ✅ Validation et nettoyage des données
- ✅ Confirmation avant création
- ✅ Résumé en fin de conversation

## 🗂️ Architecture

### Nouveaux fichiers créés

```
types/
└── voice.ts                           # Types pour la gestion vocale

hooks/
├── use-voice.ts                       # Hook pour reconnaissance/synthèse vocale
└── use-conversational.ts              # Hook pour mode conversationnel

lib/
├── intent-detector.ts                 # Détection des intentions utilisateur
└── entity-extractor.ts                # Extraction et validation des entités

components/
├── quick-access-cards.tsx             # Cartes résumées dashboard
├── action-proposal-card.tsx           # Cartes de confirmation (Deal/Action)
├── voice-indicator.tsx                # Indicateur d'état vocal
├── voice-settings-panel.tsx           # Panneau de configuration vocale
└── ui/slider.tsx                      # Composant slider (shadcn/ui)
```

### Fichiers modifiés

```
app/
└── page.tsx                           # Ajout état activeTab + QuickAccessCards

components/
└── notifications-panel.tsx            # (déjà modifié - Portal)
```

## 🎯 Comment utiliser

### Mode Vocal Automatique (Wake Word)

1. **Activation** :
   ```typescript
   const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
     mode: 'automatic',
     wakeWord: 'hey agent',
     conversationalMode: true,
     autoSpeak: true,
     language: 'fr-FR',
     voiceSpeed: 1.0,
   })
   ```

2. **Utilisation** :
   - L'assistant écoute en permanence le wake word
   - Dites "Hey Agent" pour activer
   - L'assistant répond "Oui, je vous écoute !"
   - Parlez normalement pour donner vos instructions
   - L'assistant confirme vocalement et demande validation
   - Répondez "oui" ou "non"
   - À la fin, l'assistant retourne en mode veille

### Mode Conversationnel

**Exemple de conversation** :
```
👤 : "Hey Agent"
🤖 : "Oui, je vous écoute !"

👤 : "Je viens d'avoir un appel avec TechCorp pour 50 000 euros"
🤖 : "Opportunité TechCorp pour 50 000 €, statut prospect, probabilité 50%.
      Dois-je créer cette opportunité ?"

👤 : "Oui"
🤖 : "Opportunité créée ! Devez-vous planifier un suivi ?"

👤 : "Les rappeler vendredi"
🤖 : "Action : appeler TechCorp vendredi. Je la crée ?"

👤 : "Oui"
🤖 : "Action créée ! Autre chose ?"

👤 : "Non merci"
🤖 : "Parfait ! 1 opportunité et 1 action créées. À bientôt !"
```

### Intégration dans chat-interface.tsx

```typescript
import { useVoice } from '@/hooks/use-voice'
import { useConversational } from '@/hooks/use-conversational'
import { VoiceIndicator, ConversationSummary } from '@/components/voice-indicator'
import { DealProposalCard, ActionProposalCard } from '@/components/action-proposal-card'

// Dans le composant
const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({...})

const {
  voiceState,
  isListening,
  error: voiceError,
  interimTranscript,
  speak,
  returnToWakeWordMode,
} = useVoice(
  (text, isFinal) => {
    if (isFinal) {
      // Traiter le message final
      const result = processMessage(text)

      if (result.shouldCreate) {
        createPendingItem()
        speak("Créé avec succès !")
      } else if (result.response) {
        speak(result.response)
      }
    }
  },
  voiceSettings
)

const {
  state: convState,
  pendingAction,
  processMessage,
  createPendingItem,
} = useConversational(onDealCreated, onActionCreated)
```

## 🎨 Composants UI

### VoiceIndicator
Affiche l'état actuel du système vocal :
- 🟡 En veille (listening-wake-word)
- 🟢 Actif (active)
- 🔵 En train de parler (speaking)

### ActionProposalCard / DealProposalCard
Cartes interactives pour confirmer la création en mode écrit :
- Affichage des données extraites
- Boutons : Annuler / Modifier / Créer
- Mode édition avec formulaire complet

### VoiceSettingsPanel
Panneau de configuration :
- Choix du mode vocal (Désactivé/Automatique/Manuel)
- Toggle mode conversationnel
- Toggle réponses vocales
- Slider vitesse de la voix

### QuickAccessCards
Cartes résumées pour le dashboard :
- Top 3 opportunités avec valeur totale
- Top 3 actions avec compteur d'urgence
- Boutons de navigation vers les onglets

## 🔧 Détection d'intention

### Patterns détectés

**Opportunités** :
- "créer une opportunité avec [Client] pour [Montant]"
- "nouveau deal [Client]"
- "prospect [Client] pour [Montant]"

**Actions** :
- "rappeler [Contact] [Date]"
- "envoyer email à [Contact]"
- "rendez-vous avec [Contact] [Date]"
- "préparer proposition pour [Client]"

**Confirmation** :
- "oui", "ok", "d'accord", "vas-y", "confirme"

**Annulation** :
- "non", "annule", "stop"

**Modification** :
- "non, plutôt [nouvelle valeur]"
- "[nouvelle valeur]" (ex: "60 000 euros", "14h")

### Extraction d'entités

**Pour les deals** :
- Client : noms propres après "avec", "pour", "client"
- Montant : nombres avec "€", "euros", "k", "mille"
- Statut : "prospect", "négociation", "proposition"
- Probabilité : nombres avec "%"

**Pour les actions** :
- Type : "call", "email", "meeting", "task"
- Contact : noms propres après verbes d'action
- Date : "aujourd'hui", "demain", jours de la semaine
- Heure : format "14h", "14h30", "14:30"
- Priorité : "urgent", "important" → high

## 🚀 Prochaines étapes

### Pour compléter l'intégration :

1. **Intégrer use-voice dans chat-interface.tsx** :
   - Remplacer le système vocal actuel
   - Ajouter le VoiceIndicator
   - Gérer les états vocal/écrit

2. **Intégrer use-conversational** :
   - Traiter les messages avec processMessage()
   - Afficher les cartes de proposition selon le mode
   - Gérer la création des items

3. **Ajouter le panneau de paramètres** :
   - Dans l'onglet Configuration ou dans le header
   - Sauvegarder les settings dans localStorage

4. **Enrichir le prompt système de l'IA** :
   - Ajouter les instructions pour le mode conversationnel
   - Optimiser les questions de l'IA

5. **Tests et ajustements** :
   - Tester avec différents accents
   - Ajuster les patterns de détection
   - Améliorer la reconnaissance des noms propres

## 📱 Compatibilité

### Navigateurs supportés :
- ✅ Chrome/Edge (Windows, Mac, Android)
- ✅ Safari (Mac, iOS 14.5+)
- ❌ Firefox (reconnaissance vocale non supportée)

### Permissions requises :
- 🎤 Accès au microphone
- 🔊 Autorisation de lecture audio

## 🐛 Gestion des erreurs

Le système gère :
- Microphone non disponible
- Permission refusée
- Pas de parole détectée
- Erreurs réseau
- Timeout de reconnaissance

## 📝 Notes importantes

- Les wake words acceptés : "hey agent", "hé agent", "agent"
- Le système détecte les pauses de 1.5s pour finaliser un message
- En mode automatique, l'assistant retourne en veille après chaque conversation
- Les données sont validées avant création
- Les confirmations vocales sont requises en mode automatique

---

**Créé le** : 2025-01-18
**Version** : 1.0
**Auteur** : Claude (Anthropic)
