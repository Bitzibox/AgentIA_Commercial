"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Quote, QuoteItem } from "@/types"
import { dataManager } from "@/lib/data-manager"
import { Plus, Trash2, FileText } from "lucide-react"
import { downloadQuote } from "@/lib/quote-pdf-generator"

interface QuoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote?: Quote // Si fourni, on est en mode édition
  onSave?: (quote: Quote) => void
}

export function QuoteDialog({ open, onOpenChange, quote, onSave }: QuoteDialogProps) {
  // État du formulaire
  const [company, setCompany] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [items, setItems] = useState<Omit<QuoteItem, "id">[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0, taxRate: 20 }
  ])
  const [validityDays, setValidityDays] = useState(30)
  const [paymentTerms, setPaymentTerms] = useState("30 jours nets")
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState<Quote["status"]>("Brouillon")

  // Charger les données si on est en mode édition
  useEffect(() => {
    if (quote) {
      setCompany(quote.company)
      setContact(quote.contact)
      setEmail(quote.email)
      setPhone(quote.phone || "")
      setAddress(quote.address || "")
      setItems(quote.items)
      setValidityDays(quote.validityDays)
      setPaymentTerms(quote.paymentTerms)
      setNotes(quote.notes || "")
      setStatus(quote.status)
    } else {
      // Réinitialiser le formulaire
      resetForm()
    }
  }, [quote, open])

  const resetForm = () => {
    setCompany("")
    setContact("")
    setEmail("")
    setPhone("")
    setAddress("")
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0, taxRate: 20 }])
    setValidityDays(30)
    setPaymentTerms("30 jours nets")
    setNotes("")
    setStatus("Brouillon")
  }

  // Ajouter une ligne
  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0, taxRate: 20 }])
  }

  // Supprimer une ligne
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  // Mettre à jour une ligne
  const updateItem = (index: number, field: keyof Omit<QuoteItem, "id">, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Recalculer le total de la ligne
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }

    setItems(newItems)
  }

  // Calculer les totaux
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = items.reduce((sum, item) => {
      const taxRate = item.taxRate || 0
      return sum + (item.total * taxRate / 100)
    }, 0)
    const totalAmount = subtotal + taxAmount

    return { subtotal, taxAmount, totalAmount }
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

  // Sauvegarder le devis
  const handleSave = () => {
    // Validation
    if (!company || !contact || !email) {
      alert("Veuillez remplir les champs obligatoires (Entreprise, Contact, Email)")
      return
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      alert("Veuillez remplir correctement tous les articles")
      return
    }

    // Créer les items avec des IDs
    const itemsWithIds: QuoteItem[] = items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`,
    }))

    const quoteData = {
      company,
      contact,
      email,
      phone,
      address,
      items: itemsWithIds,
      subtotal,
      taxAmount,
      totalAmount,
      validityDays,
      paymentTerms,
      notes,
      status,
    }

    if (quote) {
      // Mode édition
      const updated = dataManager.updateQuote(quote.id, quoteData)
      if (updated && onSave) {
        onSave(updated)
      }
    } else {
      // Mode création
      const newQuote = dataManager.addQuote(quoteData)
      if (onSave) {
        onSave(newQuote)
      }
    }

    onOpenChange(false)
  }

  // Générer le PDF et télécharger
  const handleDownloadPDF = async () => {
    if (!quote) {
      alert("Veuillez d'abord sauvegarder le devis avant de générer le PDF")
      return
    }

    try {
      await downloadQuote(quote)
    } catch (error) {
      console.error("Erreur génération PDF:", error)
      alert("Erreur lors de la génération du PDF")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quote ? "Modifier le devis" : "Créer un devis"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations client */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations client</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Entreprise *</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Nom de l'entreprise"
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact *</Label>
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@entreprise.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Articles / Services</h3>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-6 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        placeholder="Description de l'article"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Prix unitaire HT</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">TVA %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxRate}
                        onChange={(e) => updateItem(index, "taxRate", parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Total HT</Label>
                      <Input
                        value={item.total.toFixed(2)}
                        readOnly
                        className="h-9 bg-gray-100"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => removeItem(index)}
                    size="sm"
                    variant="ghost"
                    className="mt-5"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Totaux */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total HT:</span>
                <span className="font-semibold">{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA:</span>
                <span className="font-semibold">{taxAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>TOTAL TTC:</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conditions</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validityDays">Durée de validité (jours)</Label>
                <Input
                  id="validityDays"
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Conditions de paiement</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Comptant">Comptant</SelectItem>
                    <SelectItem value="15 jours nets">15 jours nets</SelectItem>
                    <SelectItem value="30 jours nets">30 jours nets</SelectItem>
                    <SelectItem value="45 jours nets">45 jours nets</SelectItem>
                    <SelectItem value="60 jours nets">60 jours nets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="status">Statut</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as Quote["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                    <SelectItem value="Envoyé">Envoyé</SelectItem>
                    <SelectItem value="Vu">Vu</SelectItem>
                    <SelectItem value="Accepté">Accepté</SelectItem>
                    <SelectItem value="Refusé">Refusé</SelectItem>
                    <SelectItem value="Expiré">Expiré</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes / Conditions particulières</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes ou conditions particulières..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {quote && (
            <Button onClick={handleDownloadPDF} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {quote ? "Enregistrer" : "Créer le devis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
