"use client"

import { useState } from "react"
import { Activity } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import { Plus, Phone, Mail, Calendar, Presentation, FileText, TrendingUp, TrendingDown, Activity as ActivityIcon } from "lucide-react"

interface ActivitiesManagerProps {
  activities: Activity[]
  onAdd: (activity: Omit<Activity, "id">) => void
}

export function ActivitiesManager({ activities, onAdd }: ActivitiesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<Activity, "id">>({
    type: "call",
    description: "",
    company: "",
    timestamp: new Date(),
  })

  const handleSubmit = () => {
    if (!formData.description) {
      alert("Veuillez remplir la description")
      return
    }

    onAdd({
      ...formData,
      timestamp: new Date(),
    })

    setFormData({
      type: "call",
      description: "",
      company: "",
      timestamp: new Date(),
    })
    setIsDialogOpen(false)
  }

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "demo":
        return <Presentation className="h-4 w-4" />
      case "proposal":
        return <FileText className="h-4 w-4" />
      case "won":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "lost":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <ActivityIcon className="h-4 w-4" />
    }
  }

  const getActivityLabel = (type: Activity["type"]) => {
    switch (type) {
      case "call":
        return "Appel"
      case "email":
        return "Email"
      case "meeting":
        return "Rendez-vous"
      case "demo":
        return "Démo"
      case "proposal":
        return "Proposition"
      case "won":
        return "Gagné"
      case "lost":
        return "Perdu"
      default:
        return type
    }
  }

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "won":
        return "bg-green-500"
      case "lost":
        return "bg-red-500"
      case "proposal":
        return "bg-purple-500"
      case "demo":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            <CardTitle>Activités Récentes</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter une activité
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouvelle activité</DialogTitle>
                <DialogDescription>Enregistrez une nouvelle activité commerciale</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type d'activité *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as Activity["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Appel</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Rendez-vous</SelectItem>
                      <SelectItem value="demo">Démo</SelectItem>
                      <SelectItem value="proposal">Proposition</SelectItem>
                      <SelectItem value="won">Gagné</SelectItem>
                      <SelectItem value="lost">Perdu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de l'activité"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Nom de l'entreprise (optionnel)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Montant (€)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, value: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="Montant associé (optionnel)"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Historique des 20 dernières activités ({activities.length} activités)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Aucune activité enregistrée</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={getActivityColor(activity.type)}>
                      {getActivityLabel(activity.type)}
                    </Badge>
                    <span className="text-sm font-medium">{activity.description}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.company && <span>{activity.company} • </span>}
                    {activity.value && <span>{activity.value.toLocaleString("fr-FR")} € • </span>}
                    {activity.timestamp.toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
