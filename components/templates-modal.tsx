"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  Mail,
  FileSignature,
  Briefcase,
  Phone,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { templateManager, Template } from "@/lib/template-manager"

interface TemplatesModalProps {
  trigger?: React.ReactNode
  onTemplateApply?: (content: string) => void
}

export function TemplatesModal({ trigger, onTemplateApply }: TemplatesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [mode, setMode] = useState<"browse" | "create" | "edit" | "apply">("browse")

  // Formulaire de création/édition
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] = useState<Template["category"]>("email")
  const [formDescription, setFormDescription] = useState("")
  const [formContent, setFormContent] = useState("")

  // Formulaire d'application
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Charger les templates
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = () => {
    const allTemplates = templateManager.getAllTemplates()
    setTemplates(allTemplates)
  }

  const handleCreateNew = () => {
    setMode("create")
    setFormName("")
    setFormCategory("email")
    setFormDescription("")
    setFormContent("")
  }

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setFormName(template.name)
    setFormCategory(template.category)
    setFormDescription(template.description || "")
    setFormContent(template.content)
    setMode("edit")
  }

  const handleSave = () => {
    if (!formName.trim() || !formContent.trim()) return

    if (mode === "create") {
      templateManager.createTemplate(formName, formCategory, formContent, formDescription)
    } else if (mode === "edit" && selectedTemplate) {
      templateManager.updateTemplate(selectedTemplate.id, {
        name: formName,
        category: formCategory,
        description: formDescription,
        content: formContent,
      })
    }

    loadTemplates()
    setMode("browse")
  }

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce template ?")) {
      templateManager.deleteTemplate(id)
      loadTemplates()
    }
  }

  const handleApply = (template: Template) => {
    setSelectedTemplate(template)
    setVariableValues({})
    setMode("apply")
  }

  const handleConfirmApply = () => {
    if (!selectedTemplate) return

    const content = templateManager.applyTemplate(selectedTemplate.id, variableValues)

    if (onTemplateApply) {
      onTemplateApply(content)
    }

    setIsOpen(false)
    setMode("browse")
  }

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Erreur copie:", error)
    }
  }

  const getCategoryIcon = (category: Template["category"]) => {
    switch (category) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "proposition":
        return <FileSignature className="h-4 w-4" />
      case "briefing":
        return <Briefcase className="h-4 w-4" />
      case "script":
        return <Phone className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryLabel = (category: Template["category"]) => {
    const labels = {
      email: "Email",
      proposition: "Proposition",
      briefing: "Briefing",
      script: "Script",
      autre: "Autre",
    }
    return labels[category]
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <FileText className="h-4 w-4" />
      Templates
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Mes Templates Personnalisés
          </DialogTitle>
          <DialogDescription>
            Créez et gérez vos templates de contenu réutilisables
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* Mode: Navigation et liste */}
          {mode === "browse" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {templates.length} template(s) disponible(s)
                </p>
                <Button onClick={handleCreateNew} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouveau template
                </Button>
              </div>

              {templates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Aucun template pour le moment
                    </p>
                    <Button onClick={handleCreateNew} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Créer votre premier template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategoryIcon(template.category)}
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(template.category)}
                              </Badge>
                            </div>
                            {template.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {template.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Utilisé {template.usageCount} fois</span>
                              {template.variables.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{template.variables.length} variable(s)</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleApply(template)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mode: Création ou Édition */}
          {(mode === "create" || mode === "edit") && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Email de relance post-démo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    id="category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Template["category"])}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="email">Email</option>
                    <option value="proposition">Proposition</option>
                    <option value="briefing">Briefing</option>
                    <option value="script">Script d'appel</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Courte description du template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenu du template</Label>
                  <Textarea
                    id="content"
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Contenu avec variables: {{company}}, {{contact}}, {{value}}, etc."
                    rows={10}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Utilisez &#123;&#123;variable&#125;&#125; pour les variables dynamiques
                    (ex: &#123;&#123;company&#125;&#125;, &#123;&#123;contact&#125;&#125;)
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setMode("browse")}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={!formName.trim() || !formContent.trim()}>
                  {mode === "create" ? "Créer" : "Sauvegarder"}
                </Button>
              </div>
            </div>
          )}

          {/* Mode: Application d'un template */}
          {mode === "apply" && selectedTemplate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  {getCategoryIcon(selectedTemplate.category)}
                  {selectedTemplate.name}
                </h4>
                {selectedTemplate.description && (
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                )}
              </div>

              {selectedTemplate.variables.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <Label>Remplir les variables</Label>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="space-y-1">
                        <Label htmlFor={variable} className="text-xs font-normal">
                          {variable}
                        </Label>
                        <Input
                          id={variable}
                          value={variableValues[variable] || ""}
                          onChange={(e) =>
                            setVariableValues((prev) => ({
                              ...prev,
                              [variable]: e.target.value,
                            }))
                          }
                          placeholder={`Valeur pour ${variable}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label>Aperçu</Label>
                    <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap font-mono text-xs max-h-60 overflow-y-auto">
                      {templateManager.applyTemplate(selectedTemplate.id, variableValues)}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap font-mono text-xs max-h-60 overflow-y-auto">
                  {selectedTemplate.content}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setMode("browse")}>
                  Retour
                </Button>
                <Button onClick={handleConfirmApply} className="gap-2">
                  <Check className="h-4 w-4" />
                  Utiliser ce template
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
