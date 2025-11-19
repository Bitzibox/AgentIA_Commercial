"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Quote } from "@/types"
import { dataManager } from "@/lib/data-manager"
import { downloadQuote } from "@/lib/quote-pdf-generator"
import { QuoteDialog } from "./quote-dialog"
import {
  FileText,
  Plus,
  Download,
  Mail,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  TrendingUp,
  FileCheck,
  Clock,
} from "lucide-react"

export function QuotesList() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Charger les devis
  useEffect(() => {
    loadQuotes()
  }, [refreshKey])

  // Filtrer les devis
  useEffect(() => {
    let filtered = quotes

    // Filtre par texte
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter])

  const loadQuotes = () => {
    const loadedQuotes = dataManager.getQuotes()
    // Trier par date de création décroissante
    loadedQuotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setQuotes(loadedQuotes)
    setFilteredQuotes(loadedQuotes)

    // Mettre à jour les devis expirés
    dataManager.updateExpiredQuotes()
  }

  const handleCreateNew = () => {
    setSelectedQuote(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (quote: Quote) => {
    setSelectedQuote(quote)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce devis ?")) {
      dataManager.deleteQuote(id)
      setRefreshKey((k) => k + 1)
    }
  }

  const handleDownloadPDF = async (quote: Quote) => {
    try {
      await downloadQuote(quote)
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error)
      alert("Erreur lors du téléchargement du PDF")
    }
  }

  const handleSendEmail = (quote: Quote) => {
    // Créer un mailto avec le devis en pièce jointe (simplifié)
    const subject = `Devis ${quote.quoteNumber} - ${quote.company}`
    const body = `Bonjour ${quote.contact},\n\nVeuillez trouver ci-joint notre devis ${quote.quoteNumber}.\n\nCordialement`
    window.location.href = `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Marquer comme envoyé
    dataManager.markQuoteAsSent(quote.id, "email")
    setRefreshKey((k) => k + 1)
  }

  const handleSendWhatsApp = (quote: Quote) => {
    const phone = quote.phone?.replace(/[^0-9]/g, "")
    if (!phone) {
      alert("Aucun numéro de téléphone renseigné pour ce client")
      return
    }

    const message = `Bonjour ${quote.contact}, voici votre devis ${quote.quoteNumber} d'un montant de ${quote.totalAmount.toFixed(2)}€. Merci de votre confiance !`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")

    // Marquer comme envoyé
    dataManager.markQuoteAsSent(quote.id, "whatsapp")
    setRefreshKey((k) => k + 1)
  }

  const handleSave = () => {
    setRefreshKey((k) => k + 1)
  }

  // Calculer les statistiques
  const stats = {
    total: quotes.length,
    totalAmount: quotes.reduce((sum, q) => sum + q.totalAmount, 0),
    sent: quotes.filter((q) => q.status === "Envoyé" || q.status === "Vu").length,
    accepted: quotes.filter((q) => q.status === "Accepté").length,
    draft: quotes.filter((q) => q.status === "Brouillon").length,
  }

  // Badge de statut avec couleur
  const getStatusBadge = (status: Quote["status"]) => {
    const variants: Record<Quote["status"], { variant: any; icon: any }> = {
      Brouillon: { variant: "secondary", icon: Clock },
      Envoyé: { variant: "default", icon: Mail },
      Vu: { variant: "default", icon: Eye },
      Accepté: { variant: "default", icon: FileCheck },
      Refusé: { variant: "destructive", icon: EyeOff },
      Expiré: { variant: "destructive", icon: Clock },
    }

    const { variant, icon: Icon } = variants[status]

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total devis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAmount.toFixed(0)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Acceptés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
      </div>

      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes devis</CardTitle>
              <CardDescription>Gérez et suivez tous vos devis</CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devis
            </Button>
          </div>

          {/* Filtres */}
          <div className="flex gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par client, contact ou numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Brouillon">Brouillon</SelectItem>
                <SelectItem value="Envoyé">Envoyé</SelectItem>
                <SelectItem value="Vu">Vu</SelectItem>
                <SelectItem value="Accepté">Accepté</SelectItem>
                <SelectItem value="Refusé">Refusé</SelectItem>
                <SelectItem value="Expiré">Expiré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {quotes.length === 0
                  ? "Aucun devis pour le moment. Créez votre premier devis !"
                  : "Aucun devis ne correspond à vos critères de recherche."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Informations principales */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{quote.company}</h3>
                          {getStatusBadge(quote.status)}
                          {quote.opened && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Ouvert {quote.openCount}x
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{quote.quoteNumber}</span>
                            <span>•</span>
                            <span>{quote.contact}</span>
                            <span>•</span>
                            <span>{quote.email}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span>
                              Créé le {new Date(quote.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            <span>•</span>
                            <span>
                              Expire le {new Date(quote.expiresAt).toLocaleDateString("fr-FR")}
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-blue-600">
                              {quote.totalAmount.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleDownloadPDF(quote)}
                          size="sm"
                          variant="outline"
                          title="Télécharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleSendEmail(quote)}
                          size="sm"
                          variant="outline"
                          title="Envoyer par email"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleSendWhatsApp(quote)}
                          size="sm"
                          variant="outline"
                          title="Envoyer par WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEdit(quote)}
                          size="sm"
                          variant="outline"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(quote.id)}
                          size="sm"
                          variant="outline"
                          title="Supprimer"
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <QuoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        quote={selectedQuote}
        onSave={handleSave}
      />
    </div>
  )
}
