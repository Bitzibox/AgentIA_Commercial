"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ActionItem } from "@/types"
import { Plus, Edit } from "lucide-react"

interface ActionDialogProps {
  action?: ActionItem
  onSave: (action: Omit<ActionItem, "id"> | ActionItem) => void
  trigger?: React.ReactNode
}

export function ActionDialog({ action, onSave, trigger }: ActionDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<ActionItem>>({
    title: "",
    description: "",
    priority: "medium",
    completed: false,
    dueDate: undefined,
  })

  // Charger les données de l'action si en mode édition
  useEffect(() => {
    if (action && isOpen) {
      setFormData({
        title: action.title,
        description: action.description,
        priority: action.priority,
        completed: action.completed,
        dueDate: action.dueDate,
        relatedTo: action.relatedTo,
      })
    } else if (!isOpen) {
      // Reset quand on ferme
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        completed: false,
        dueDate: undefined,
      })
    }
  }, [action, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    const actionData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || "medium",
      completed: formData.completed || false,
      dueDate: formData.dueDate,
      relatedTo: formData.relatedTo,
    } as ActionItem

    if (action) {
      // Mode édition
      onSave({ ...actionData, id: action.id })
    } else {
      // Mode création
      onSave(actionData)
    }

    setIsOpen(false)
  }

  const defaultTrigger = action ? (
    <Button variant="ghost" size="sm" className="h-8">
      <Edit className="h-3 w-3" />
    </Button>
  ) : (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Nouvelle Action
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{action ? "Modifier l'action" : "Nouvelle action"}</DialogTitle>
          <DialogDescription>
            {action
              ? "Modifiez les informations de l'action"
              : "Ajoutez une nouvelle action à votre liste"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Titre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Titre de l'action"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description détaillée de l'action"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value as ActionItem["priority"] })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="high">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDate: e.target.value ? new Date(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">{action ? "Enregistrer" : "Créer l'action"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
