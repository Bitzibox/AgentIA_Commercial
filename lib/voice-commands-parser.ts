// Parser de commandes vocales pour contrôler l'assistant

export type VoiceCommand =
  | { type: "stop" }
  | { type: "pause" }
  | { type: "resume"; value: "reprends" | "continue" }
  | { type: "repeat" }
  | { type: "faster" }
  | { type: "slower" }
  | { type: "louder" }
  | { type: "quieter" }
  | { type: "help" }
  | { type: "exit" }
  | { type: "message"; text: string }

export class VoiceCommandsParser {
  // Mots-clés pour les commandes
  private readonly commandPatterns = {
    stop: ["stop", "arrête", "arrête", "stoppe", "tais-toi"],
    pause: ["pause", "attends", "met en pause"],
    resume: ["reprends", "continue", "reprend", "reprise"],
    repeat: ["répète", "repete", "redis", "encore", "répéter"],
    faster: ["plus vite", "accélère", "accélérer", "rapide"],
    slower: ["plus lent", "ralentis", "ralentir", "doucement"],
    louder: ["plus fort", "monte le son", "volume"],
    quieter: ["plus bas", "baisse le son", "moins fort"],
    help: ["aide", "commandes", "que peux-tu faire"],
    exit: ["quitte", "ferme", "termine", "fin", "sortir"],
  }

  // Parser une transcription vocale en commande
  parse(transcript: string): VoiceCommand {
    const normalized = transcript.toLowerCase().trim()

    // Vérifier les commandes dans l'ordre de priorité

    // Stop (priorité maximale)
    if (this.matchesPattern(normalized, this.commandPatterns.stop)) {
      return { type: "stop" }
    }

    // Pause
    if (this.matchesPattern(normalized, this.commandPatterns.pause)) {
      return { type: "pause" }
    }

    // Resume
    if (this.matchesPattern(normalized, this.commandPatterns.resume)) {
      return { type: "resume", value: "reprends" }
    }

    // Repeat
    if (this.matchesPattern(normalized, this.commandPatterns.repeat)) {
      return { type: "repeat" }
    }

    // Faster
    if (this.matchesPattern(normalized, this.commandPatterns.faster)) {
      return { type: "faster" }
    }

    // Slower
    if (this.matchesPattern(normalized, this.commandPatterns.slower)) {
      return { type: "slower" }
    }

    // Louder
    if (this.matchesPattern(normalized, this.commandPatterns.louder)) {
      return { type: "louder" }
    }

    // Quieter
    if (this.matchesPattern(normalized, this.commandPatterns.quieter)) {
      return { type: "quieter" }
    }

    // Help
    if (this.matchesPattern(normalized, this.commandPatterns.help)) {
      return { type: "help" }
    }

    // Exit
    if (this.matchesPattern(normalized, this.commandPatterns.exit)) {
      return { type: "exit" }
    }

    // Par défaut, c'est un message normal
    return { type: "message", text: transcript }
  }

  // Vérifier si le texte matche un des patterns
  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
      // Match exact ou début de phrase
      return (
        text === pattern ||
        text.startsWith(pattern + " ") ||
        text.startsWith(pattern + ",") ||
        text.endsWith(" " + pattern) ||
        text.includes(" " + pattern + " ")
      )
    })
  }

  // Vérifier si c'est une commande (pas un message normal)
  isCommand(transcript: string): boolean {
    const command = this.parse(transcript)
    return command.type !== "message"
  }

  // Obtenir le message d'aide
  getHelpMessage(): string {
    return `**Commandes vocales disponibles :**

🛑 **Contrôle de lecture**
- "Stop" ou "Arrête" - Arrêter l'assistant
- "Pause" - Mettre en pause
- "Reprends" ou "Continue" - Reprendre la lecture
- "Répète" - Répéter la dernière réponse

⚙️ **Réglages**
- "Plus vite" - Accélérer la voix
- "Plus lent" - Ralentir la voix
- "Plus fort" - Augmenter le volume
- "Plus bas" - Diminuer le volume

📋 **Autres**
- "Aide" - Afficher cette aide
- "Quitte" - Quitter le mode vocal

💬 **Sinon, parlez naturellement** et l'assistant répondra !`
  }
}

// Instance singleton
export const voiceCommandsParser = new VoiceCommandsParser()
