// Système de gestion des templates personnalisables

export interface Template {
  id: string
  name: string
  category: "email" | "proposition" | "briefing" | "script" | "autre"
  description?: string
  content: string // Contenu du template avec variables possibles
  variables: string[] // Liste des variables utilisées (ex: ["company", "contact", "value"])
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

export interface TemplateVariable {
  name: string
  label: string
  defaultValue?: string
  required: boolean
}

// Variables disponibles par défaut
export const DEFAULT_VARIABLES: Record<string, TemplateVariable> = {
  company: {
    name: "company",
    label: "Nom de l'entreprise",
    required: true,
  },
  contact: {
    name: "contact",
    label: "Nom du contact",
    required: true,
  },
  value: {
    name: "value",
    label: "Valeur du deal",
    required: false,
  },
  stage: {
    name: "stage",
    label: "Phase du deal",
    required: false,
  },
  nextStep: {
    name: "nextStep",
    label: "Prochaine étape",
    required: false,
  },
  email: {
    name: "email",
    label: "Email du contact",
    required: false,
  },
  phone: {
    name: "phone",
    label: "Téléphone",
    required: false,
  },
}

class TemplateManager {
  private storageKey = "custom_templates"

  // Récupérer tous les templates
  getAllTemplates(): Template[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []

      const templates = JSON.parse(stored)
      // Convertir les dates en objets Date
      return templates.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      }))
    } catch (error) {
      console.error("Erreur lecture templates:", error)
      return []
    }
  }

  // Récupérer un template par ID
  getTemplate(id: string): Template | null {
    const templates = this.getAllTemplates()
    return templates.find((t) => t.id === id) || null
  }

  // Récupérer les templates par catégorie
  getTemplatesByCategory(category: Template["category"]): Template[] {
    return this.getAllTemplates().filter((t) => t.category === category)
  }

  // Créer un nouveau template
  createTemplate(
    name: string,
    category: Template["category"],
    content: string,
    description?: string
  ): Template {
    // Extraire les variables du contenu (format {{variable}})
    const variables = this.extractVariables(content)

    const template: Template = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      category,
      description,
      content,
      variables,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    }

    const templates = this.getAllTemplates()
    templates.push(template)
    this.saveTemplates(templates)

    return template
  }

  // Mettre à jour un template existant
  updateTemplate(id: string, updates: Partial<Template>): Template | null {
    const templates = this.getAllTemplates()
    const index = templates.findIndex((t) => t.id === id)

    if (index === -1) return null

    // Si le contenu change, réextraire les variables
    if (updates.content) {
      updates.variables = this.extractVariables(updates.content)
    }

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date(),
    }

    this.saveTemplates(templates)
    return templates[index]
  }

  // Supprimer un template
  deleteTemplate(id: string): boolean {
    const templates = this.getAllTemplates()
    const filtered = templates.filter((t) => t.id !== id)

    if (filtered.length === templates.length) return false

    this.saveTemplates(filtered)
    return true
  }

  // Incrémenter le compteur d'utilisation
  incrementUsage(id: string): void {
    const templates = this.getAllTemplates()
    const template = templates.find((t) => t.id === id)

    if (template) {
      template.usageCount++
      this.saveTemplates(templates)
    }
  }

  // Appliquer un template avec des valeurs
  applyTemplate(templateId: string, values: Record<string, string>): string {
    const template = this.getTemplate(templateId)
    if (!template) return ""

    let result = template.content

    // Remplacer toutes les variables
    template.variables.forEach((variable) => {
      const value = values[variable] || ""
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, "g")
      result = result.replace(regex, value)
    })

    this.incrementUsage(templateId)
    return result
  }

  // Extraire les variables d'un contenu (format {{variable}})
  private extractVariables(content: string): string[] {
    const regex = /\{\{(\w+)\}\}/g
    const matches = content.matchAll(regex)
    const variables = new Set<string>()

    for (const match of matches) {
      variables.add(match[1])
    }

    return Array.from(variables)
  }

  // Sauvegarder les templates
  private saveTemplates(templates: Template[]): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(templates))
    } catch (error) {
      console.error("Erreur sauvegarde templates:", error)
    }
  }

  // Exporter les templates en JSON
  exportTemplates(): string {
    const templates = this.getAllTemplates()
    return JSON.stringify(templates, null, 2)
  }

  // Importer des templates depuis JSON
  importTemplates(jsonData: string): number {
    try {
      const imported = JSON.parse(jsonData)
      if (!Array.isArray(imported)) {
        throw new Error("Format invalide")
      }

      const existing = this.getAllTemplates()
      const merged = [...existing, ...imported]
      this.saveTemplates(merged)

      return imported.length
    } catch (error) {
      console.error("Erreur import templates:", error)
      return 0
    }
  }

  // Templates par défaut (exemples)
  initializeDefaultTemplates(): void {
    const existing = this.getAllTemplates()
    if (existing.length > 0) return // Déjà initialisé

    const defaults: Omit<Template, "id" | "createdAt" | "updatedAt" | "usageCount">[] = [
      {
        name: "Email de relance standard",
        category: "email",
        description: "Email de relance professionnel et concis",
        content: `Objet: Point sur notre échange - {{company}}

Bonjour {{contact}},

J'espère que vous allez bien. Je reviens vers vous concernant notre échange sur {{nextStep}}.

Avez-vous eu l'occasion d'y réfléchir ? Je serais ravi de vous accompagner dans ce projet.

Seriez-vous disponible pour un point rapide cette semaine ?

Bien cordialement`,
        variables: ["company", "contact", "nextStep"],
      },
      {
        name: "Proposition express",
        category: "proposition",
        description: "Proposition commerciale concise",
        content: `# Proposition commerciale - {{company}}

## Contexte
Suite à notre échange avec {{contact}}, voici notre proposition pour {{nextStep}}.

## Solution proposée
[Détails de la solution...]

## Investissement
Valeur estimée: {{value}} €

## Prochaines étapes
1. Validation de la proposition
2. Planification du projet
3. Démarrage

Restons en contact pour avancer ensemble sur ce projet.`,
        variables: ["company", "contact", "nextStep", "value"],
      },
    ]

    defaults.forEach((template) => {
      this.createTemplate(
        template.name,
        template.category,
        template.content,
        template.description
      )
    })
  }
}

// Instance singleton
export const templateManager = new TemplateManager()
