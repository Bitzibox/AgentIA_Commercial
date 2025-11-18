"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, CheckSquare, ArrowRight, TrendingUp, Clock } from "lucide-react"
import { Deal, ActionItem } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface QuickAccessCardsProps {
  deals: Deal[]
  actions: ActionItem[]
  onNavigateToDeals: () => void
  onNavigateToActions: () => void
}

export function QuickAccessCards({ deals, actions, onNavigateToDeals, onNavigateToActions }: QuickAccessCardsProps) {
  const urgentActions = actions.filter(a => a.priority === "high" && a.status === "todo")
  const totalDealsValue = deals.reduce((sum, deal) => sum + deal.amount, 0)
  const activeDeals = deals.filter(d => d.status !== "lost" && d.status !== "won")

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Opportunités */}
      <Card className="hover:shadow-lg transition-shadow border-2">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Opportunités</CardTitle>
            </div>
            <Badge variant="secondary" className="text-lg font-bold">
              {activeDeals.length}
            </Badge>
          </div>
          <CardDescription>Pipeline actif</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Statistiques résumées */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-100/50 to-purple-100/50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Valeur totale</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDealsValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600 opacity-50" />
            </div>

            {/* Top 3 opportunités */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Top opportunités</p>
              {deals.slice(0, 3).map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{deal.client}</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(deal.amount)}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {deal.probability}%
                  </Badge>
                </div>
              ))}
            </div>

            {/* Bouton d'accès */}
            <Button
              onClick={onNavigateToDeals}
              className="w-full gap-2"
              variant="default"
            >
              Voir toutes les opportunités
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="hover:shadow-lg transition-shadow border-2">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-600" />
              <CardTitle>Actions</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {urgentActions.length > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {urgentActions.length} urgente{urgentActions.length > 1 ? 's' : ''}
                </Badge>
              )}
              <Badge variant="secondary" className="text-lg font-bold">
                {actions.filter(a => a.status === "todo").length}
              </Badge>
            </div>
          </div>
          <CardDescription>À faire</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Actions urgentes */}
            {urgentActions.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-red-100/50 to-orange-100/50 dark:from-red-950/50 dark:to-orange-950/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-red-600" />
                  <p className="font-semibold text-red-600">Actions urgentes</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {urgentActions.length} action{urgentActions.length > 1 ? 's' : ''} prioritaire{urgentActions.length > 1 ? 's' : ''} à traiter
                </p>
              </div>
            )}

            {/* Top 3 actions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Prochaines actions</p>
              {actions.filter(a => a.status === "todo").slice(0, 3).map((action) => (
                <div key={action.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{action.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{action.description}</p>
                  </div>
                  {action.priority === "high" && (
                    <Badge variant="destructive" className="shrink-0">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))}
              {actions.filter(a => a.status === "todo").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune action en attente 👍
                </p>
              )}
            </div>

            {/* Bouton d'accès */}
            <Button
              onClick={onNavigateToActions}
              className="w-full gap-2"
              variant="default"
            >
              Voir toutes les actions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
