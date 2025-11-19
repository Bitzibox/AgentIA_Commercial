"use client"

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, CheckSquare, Check, X, Edit, FileText } from 'lucide-react'
import { Deal, ActionItem, Quote } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface DealProposalCardProps {
  deal: Partial<Deal>
  onConfirm: (deal: Partial<Deal>) => void
  onCancel: () => void
}

export function DealProposalCard({ deal: initialDeal, onConfirm, onCancel }: DealProposalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deal, setDeal] = useState<Partial<Deal>>(initialDeal)

  const handleConfirm = () => {
    onConfirm(deal)
  }

  if (isEditing) {
    return (
      <Card className="border-2 border-blue-300 shadow-lg animate-in slide-in-from-bottom duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Modifier l'opportunité
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="client">Client *</Label>
            <Input
              id="client"
              value={(deal as any).client ?? ''}
              onChange={(e) => setDeal({ ...deal, client: e.target.value } as any)}
              placeholder="Nom du client"
            />
          </div>

          <div>
            <Label htmlFor="amount">Montant (€) *</Label>
            <Input
              id="amount"
              type="number"
              value={(deal as any).amount ?? 0}
              onChange={(e) => setDeal({ ...deal, amount: parseInt(e.target.value) || 0 } as any)}
              placeholder="50000"
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select value={(deal as any).status ?? 'prospect'} onValueChange={(value) => setDeal({ ...deal, status: value } as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="proposal">Proposition</SelectItem>
                <SelectItem value="negotiation">Négociation</SelectItem>
                <SelectItem value="won">Gagné</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="probability">Probabilité (%) *</Label>
            <Input
              id="probability"
              type="number"
              min="0"
              max="100"
              value={(deal as any).probability ?? 50}
              onChange={(e) => setDeal({ ...deal, probability: parseInt(e.target.value) || 50 } as any)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={(deal as any).description ?? ''}
              onChange={(e) => setDeal({ ...deal, description: e.target.value } as any)}
              placeholder="Détails supplémentaires..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
            Retour
          </Button>
          <Button onClick={handleConfirm} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Créer
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-300 shadow-lg animate-in slide-in-from-bottom duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Opportunité à créer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Client :</span>
            <span className="font-semibold">{(deal as any).client || 'Non spécifié'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Montant :</span>
            <span className="font-semibold text-blue-600 text-lg">
              {(deal as any).amount ? formatCurrency((deal as any).amount) : '0 €'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Statut :</span>
            <span className="font-medium capitalize">{(deal as any).status ?? 'prospect'}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Probabilité :</span>
            <span className="font-medium">{(deal as any).probability ?? 50}%</span>
          </div>

          {(deal as any).description && (
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground block mb-1">Description :</span>
              <p className="text-sm">{(deal as any).description}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 gap-2">
          <X className="h-4 w-4" />
          Annuler
        </Button>
        <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex-1 gap-2">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button onClick={handleConfirm} className="flex-1 gap-2">
          <Check className="h-4 w-4" />
          Créer
        </Button>
      </CardFooter>
    </Card>
  )
}

interface ActionProposalCardProps {
  action: Partial<ActionItem>
  onConfirm: (action: Partial<ActionItem>) => void
  onCancel: () => void
}

export function ActionProposalCard({ action: initialAction, onConfirm, onCancel }: ActionProposalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [action, setAction] = useState<Partial<ActionItem>>(initialAction)

  const handleConfirm = () => {
    onConfirm(action)
  }

  const typeLabels: Record<string, string> = {
    call: '📞 Appel',
    email: '📧 Email',
    meeting: '📅 Rendez-vous',
    task: '✓ Tâche',
  }

  const priorityLabels: Record<string, string> = {
    high: 'Haute',
    medium: 'Moyenne',
    low: 'Basse',
  }

  if (isEditing) {
    return (
      <Card className="border-2 border-purple-300 shadow-lg animate-in slide-in-from-bottom duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Modifier l'action
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={(action as any).title ?? ''}
              onChange={(e) => setAction({ ...action, title: e.target.value } as any)}
              placeholder="Titre de l'action"
            />
          </div>

          <div>
            <Label htmlFor="type">Type *</Label>
            <Select value={(action as any).type ?? 'call'} onValueChange={(value) => setAction({ ...action, type: value } as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">📞 Appel</SelectItem>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="meeting">📅 Rendez-vous</SelectItem>
                <SelectItem value="task">✓ Tâche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priorité *</Label>
            <Select value={(action as any).priority ?? 'medium'} onValueChange={(value) => setAction({ ...action, priority: value } as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dueDate">Date d'échéance *</Label>
            <Input
              id="dueDate"
              type="date"
              value={(action as any).dueDate ? new Date((action as any).dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setAction({ ...action, dueDate: new Date(e.target.value) } as any)}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={(action as any).description ?? ''}
              onChange={(e) => setAction({ ...action, description: e.target.value } as any)}
              placeholder="Détails de l'action..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">
            Retour
          </Button>
          <Button onClick={handleConfirm} className="flex-1 gap-2">
            <Check className="h-4 w-4" />
            Créer
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-purple-300 shadow-lg animate-in slide-in-from-bottom duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Action à créer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Type :</span>
            <span className="font-medium">{typeLabels[(action as any).type ?? 'call']}</span>
          </div>

          <div className="border-t pt-2">
            <h4 className="font-semibold text-lg mb-1">{(action as any).title || 'Sans titre'}</h4>
            {(action as any).description && (
              <p className="text-sm text-muted-foreground">{(action as any).description}</p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Échéance :</span>
            <span className="font-medium">
              {(action as any).dueDate
                ? new Date((action as any).dueDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                  })
                : 'Non définie'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Priorité :</span>
            <span
              className={`font-medium ${
                ((action as any).priority ?? 'medium') === 'high'
                  ? 'text-red-600'
                  : ((action as any).priority ?? 'medium') === 'low'
                    ? 'text-gray-600'
                    : 'text-orange-600'
              }`}
            >
              {priorityLabels[(action as any).priority ?? 'medium']}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 gap-2">
          <X className="h-4 w-4" />
          Annuler
        </Button>
        <Button onClick={() => setIsEditing(true)} variant="secondary" className="flex-1 gap-2">
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        <Button onClick={handleConfirm} className="flex-1 gap-2">
          <Check className="h-4 w-4" />
          Créer
        </Button>
      </CardFooter>
    </Card>
  )
}

interface QuoteProposalCardProps {
  quote: Partial<Quote>
  onConfirm: (quote: Partial<Quote>) => void
  onCancel: () => void
}

export function QuoteProposalCard({ quote: initialQuote, onConfirm, onCancel }: QuoteProposalCardProps) {
  const [quote, setQuote] = useState<Partial<Quote>>(initialQuote)

  const handleConfirm = () => {
    onConfirm(quote)
  }

  const formatAmount = (amount: number | undefined) => {
    if (!amount) return '0,00 €'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <Card className="w-full border-2 border-blue-500 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <FileText className="h-5 w-5" />
          Devis à créer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Client */}
          <div>
            <Label className="text-sm text-gray-600">Client</Label>
            <Input
              value={quote.company || ''}
              onChange={(e) => setQuote({ ...quote, company: e.target.value })}
              placeholder="Nom du client"
            />
          </div>

          {/* Contact */}
          <div>
            <Label className="text-sm text-gray-600">Contact</Label>
            <Input
              value={quote.contact || ''}
              onChange={(e) => setQuote({ ...quote, contact: e.target.value })}
              placeholder="Nom du contact"
            />
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm text-gray-600">Email</Label>
            <Input
              type="email"
              value={quote.email || ''}
              onChange={(e) => setQuote({ ...quote, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>

          {/* Articles */}
          {quote.items && quote.items.length > 0 && (
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Articles</Label>
              <div className="space-y-2">
                {quote.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                    <span className="font-semibold">{item.quantity}x</span>
                    <span className="flex-1">{item.description}</span>
                    <span className="text-blue-600 font-semibold">{formatAmount(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Montants */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total HT:</span>
              <span className="font-semibold">{formatAmount(quote.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TVA:</span>
              <span className="font-semibold">{formatAmount(quote.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total TTC:</span>
              <span className="text-blue-600">{formatAmount(quote.totalAmount)}</span>
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <span className="block text-xs">Validité</span>
              <span className="font-semibold">{quote.validityDays || 30} jours</span>
            </div>
            <div>
              <span className="block text-xs">Paiement</span>
              <span className="font-semibold">{quote.paymentTerms || '30 jours nets'}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 gap-2">
          <X className="h-4 w-4" />
          Annuler
        </Button>
        <Button onClick={handleConfirm} className="flex-1 gap-2">
          <Check className="h-4 w-4" />
          Créer le devis
        </Button>
      </CardFooter>
    </Card>
  )
}
