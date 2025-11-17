"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, TrendingUp, Edit } from "lucide-react"
import { Deal } from "@/types"

interface DealDialogProps {
  deal?: Deal
  onSave: (deal: Omit<Deal, "id"> | Deal) => void
  trigger?: React.ReactNode
}

export function DealDialog({ deal, onSave, trigger }: DealDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    company: "",
    contact: "",
    value: "",
    stage: "Prospection" as Deal["stage"],
    probability: "25",
    nextStep: "",
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")

  // Charger les données du deal si en mode édition
  useEffect(() => {
    if (deal && isOpen) {
      setFormData({
        company: deal.company,
        contact: deal.contact,
        value: deal.value.toString(),
        stage: deal.stage,
        probability: deal.probability.toString(),
        nextStep: deal.nextStep || "",
        tags: deal.tags || [],
      })
    } else if (!isOpen) {
      // Reset quand on ferme
      setFormData({
        company: "",
        contact: "",
        value: "",
        stage: "Prospection",
        probability: "25",
        nextStep: "",
        tags: [],
      })
    }
  }, [deal, isOpen])

  const stages: Deal["stage"][] = [
    "Prospection",
    "Qualification",
    "Proposition",
    "Négociation",
    "Closing",
    "Gagné",
    "Perdu",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.company || !formData.contact || !formData.value) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    const dealData = {
      company: formData.company,
      contact: formData.contact,
      value: parseFloat(formData.value),
      stage: formData.stage,
      probability: parseInt(formData.probability),
      lastActivity: new Date(),
      nextStep: formData.nextStep || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    if (deal) {
      // Mode édition
      onSave({ ...dealData, id: deal.id } as Deal)
    } else {
      // Mode création
      onSave(dealData)
    }

    setIsOpen(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const defaultTrigger = deal ? (
    <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="h-8">
      <Edit className="h-3 w-3" />
    </Button>
  ) : (
    <Button
      onClick={() => setIsOpen(true)}
      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
    >
      <Plus className="h-4 w-4" />
      Nouvelle Opportunité
    </Button>
  )

  if (!isOpen) {
    return <div onClick={() => setIsOpen(true)}>{trigger || defaultTrigger}</div>
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                {deal ? <Edit className="h-5 w-5 text-white" /> : <TrendingUp className="h-5 w-5 text-white" />}
              </div>
              <div>
                <CardTitle>{deal ? "Modifier l'opportunité" : "Nouvelle Opportunité"}</CardTitle>
                <CardDescription>
                  {deal ? "Modifiez les informations du deal" : "Ajoutez un nouveau deal à votre pipeline"}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Entreprise <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="TechCorp Solutions"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Contact <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Marie Dubois"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Valeur (€) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="50000"
                    required
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Probabilité (%)</label>
                  <Input
                    type="number"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                    placeholder="25"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Étape */}
            <div>
              <label className="text-sm font-medium mb-2 block">Étape du pipeline</label>
              <div className="grid grid-cols-3 gap-2">
                {stages.map((stage) => (
                  <Button
                    key={stage}
                    type="button"
                    variant={formData.stage === stage ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, stage })}
                    className="text-xs"
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>

            {/* Prochaine étape */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prochaine étape</label>
              <Input
                value={formData.nextStep}
                onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
                placeholder="Envoyer la proposition commerciale"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {deal ? "Enregistrer" : "Créer l'opportunité"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
