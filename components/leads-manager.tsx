"use client"

import { useState } from "react"
import { Lead } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Users, Mail, Phone, Star } from "lucide-react"

interface LeadsManagerProps {
  leads: Lead[]
  onAdd: (lead: Omit<Lead, "id">) => void
  onUpdate: (id: string, updates: Partial<Lead>) => void
  onDelete: (id: string) => void
}

export function LeadsManager({ leads, onAdd, onUpdate, onDelete }: LeadsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState<Partial<Lead>>({
    company: "",
    contact: "",
    email: "",
    phone: "",
    source: "",
    score: 50,
    status: "Nouveau",
    notes: "",
  })

  const handleOpenDialog = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead)
      setFormData(lead)
    } else {
      setEditingLead(null)
      setFormData({
        company: "",
        contact: "",
        email: "",
        phone: "",
        source: "",
        score: 50,
        status: "Nouveau",
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!formData.company || !formData.contact || !formData.email) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (editingLead) {
      onUpdate(editingLead.id, formData)
    } else {
      onAdd({
        ...formData,
        createdAt: new Date(),
      } as Omit<Lead, "id">)
    }

    setIsDialogOpen(false)
  }

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "Nouveau":
        return "bg-blue-500"
      case "Contacté":
        return "bg-yellow-500"
      case "Qualifié":
        return "bg-green-500"
      case "Non qualifié":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Gestion des Hot Leads</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLead ? "Modifier le lead" : "Nouveau lead"}</DialogTitle>
                <DialogDescription>
                  {editingLead
                    ? "Modifiez les informations du lead"
                    : "Ajoutez un nouveau lead à suivre"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact *</Label>
                    <Input
                      id="contact"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="Nom du contact"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@entreprise.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="LinkedIn, Site web, Recommandation..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({ ...formData, status: value as Lead["status"] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nouveau">Nouveau</SelectItem>
                        <SelectItem value="Contacté">Contacté</SelectItem>
                        <SelectItem value="Qualifié">Qualifié</SelectItem>
                        <SelectItem value="Non qualifié">Non qualifié</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="score">Score (0-100)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes sur le lead..."
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>{editingLead ? "Modifier" : "Ajouter"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Gérez vos leads les plus prometteurs ({leads.length} leads)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leads.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucun lead pour le moment</p>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold">{lead.company}</h4>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${getScoreColor(lead.score)}`} />
                      <span className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{lead.contact}</span>
                      <span>•</span>
                      <Mail className="h-3 w-3" />
                      <span>{lead.email}</span>
                      {lead.phone && (
                        <>
                          <span>•</span>
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </>
                      )}
                    </div>
                    <div>
                      Source: {lead.source} • Créé le{" "}
                      {lead.createdAt.toLocaleDateString("fr-FR")}
                    </div>
                    {lead.notes && <div className="italic">{lead.notes}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDialog(lead)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Supprimer le lead ${lead.company} ?`)) {
                        onDelete(lead.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
