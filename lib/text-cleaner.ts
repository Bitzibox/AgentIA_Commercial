// Nettoyer le texte pour la synthèse vocale
// Retire le formatage markdown et la ponctuation inutile

export function cleanTextForSpeech(text: string): string {
  if (!text) {
    console.log('[TextCleaner] Texte vide ou null reçu')
    return ""
  }

  console.log('[TextCleaner] Texte original:', text.substring(0, 100) + (text.length > 100 ? '...' : ''))

  let cleaned = text

  // Supprimer les blocs de code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " code omis ")
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1")

  // Supprimer les liens markdown mais garder le texte
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

  // Supprimer le formatage gras/italique (astérisques)
  cleaned = cleaned.replace(/\*\*\*([^*]+)\*\*\*/g, "$1") // gras + italique
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1") // gras
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1") // italique
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1") // gras alt
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1") // italique alt

  // Supprimer les titres markdown (# ## ###)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "")

  // Supprimer les listes markdown
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, "") // listes non ordonnées
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, "") // listes ordonnées

  // Supprimer les blockquotes
  cleaned = cleaned.replace(/^\s*>\s+/gm, "")

  // Supprimer les lignes horizontales
  cleaned = cleaned.replace(/^[-*_]{3,}\s*$/gm, "")

  // Supprimer les caractères de ponctuation qui ne sont pas utiles vocalement
  // Garder les virgules, points, points d'interrogation et d'exclamation
  // car ils aident à la prosodie
  cleaned = cleaned.replace(/[~]/g, "") // tilde
  cleaned = cleaned.replace(/\|/g, " ") // pipe

  // Remplacer les retours à la ligne multiples par un seul espace
  cleaned = cleaned.replace(/\n\s*\n/g, ". ")
  cleaned = cleaned.replace(/\n/g, " ")

  // Nettoyer les espaces multiples
  cleaned = cleaned.replace(/\s+/g, " ")

  // Trim
  cleaned = cleaned.trim()

  console.log('[TextCleaner] Texte nettoyé:', cleaned.substring(0, 100) + (cleaned.length > 100 ? '...' : ''))
  console.log('[TextCleaner] Longueur: original=' + text.length + ', nettoyé=' + cleaned.length)

  return cleaned
}
