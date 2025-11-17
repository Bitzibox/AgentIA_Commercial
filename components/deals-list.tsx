"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DealDialog } from "@/components/deal-dialog"
import { Deal } from "@/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Building2, TrendingUp, Calendar, User, Trash2, Edit } from "lucide-react"

interface DealsListProps {
  deals: Deal[]
  onAdd?: (deal: Omit<Deal, "id">) => void
  onUpdate?: (id: string, updates: Partial<Deal>) => void
  onDelete?: (id: string) => void
}

export function DealsList({ deals, onAdd, onUpdate, onDelete }: DealsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getStageColor = (stage: Deal["stage"]) => {
    const colors = {
      Prospection: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200",
      Qualification: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200",
      Proposition: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200",
      Négociation: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200",
      Closing: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200",
      Gagné: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900 dark:text-emerald-200",
      Perdu: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200",
    }
    return colors[stage]
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600 dark:text-green-400"
    if (probability >= 40) return "text-orange-600 dark:text-orange-400"
    return "text-gray-600 dark:text-gray-400"
  }

  const handleDelete = (id: string, company: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'opportunité "${company}" ?`)) {
      onDelete?.(id)
    }
  }

  const handleSave = (dealData: Omit<Deal, "id"> | Deal) => {
    if ("id" in dealData) {
      // Mode édition
      onUpdate?.(dealData.id, dealData)
    } else {
      // Mode création
      onAdd?.(dealData)
    }
  }

  return (
    <Card className="shadow-xl border-2 border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/50 dark:to-purple-950/50 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">Opportunités</div>
              <div className="text-sm font-normal text-muted-foreground">
                {deals.length} deal{deals.length > 1 ? "s" : ""} en cours
              </div>
            </div>
          </CardTitle>
          {onAdd && <DealDialog onSave={handleSave} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {deals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Aucune opportunité</p>
            <p className="text-sm">Ajoutez votre première opportunité pour commencer</p>
          </div>
        ) : (
          deals.map((deal, index) => (
            <div
              key={deal.id}
              className={cn(
                "flex flex-col gap-3 p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer",
                "bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50",
                "hover:border-blue-400 dark:hover:border-purple-500 hover:shadow-xl hover:shadow-blue-100/50 dark:hover:shadow-purple-900/20 hover:scale-[1.02]",
                expandedId === deal.id && "border-purple-500 shadow-xl shadow-purple-100/50 dark:shadow-purple-900/30",
                "animate-in slide-in-from-bottom-3",
                "border-slate-200 dark:border-slate-700"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setExpandedId(expandedId === deal.id ? null : deal.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg truncate">{deal.company}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{deal.contact}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(deal.value)}
                  </p>
                  <p className={cn("text-sm font-medium flex items-center gap-1 justify-end", getProbabilityColor(deal.probability))}>
                    <TrendingUp className="h-3 w-3" />
                    {deal.probability}%
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn(getStageColor(deal.stage), "font-medium")} variant="outline">
                  {deal.stage}
                </Badge>
                {deal.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {deal.nextStep && (
                <div className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-3 rounded-lg border">
                  <p className="font-medium text-xs text-muted-foreground mb-1">📌 Prochaine étape :</p>
                  <p className="font-medium">{deal.nextStep}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(deal.lastActivity)}
                </div>

                {(onUpdate || onDelete) && (
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {onUpdate && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <DealDialog
                          deal={deal}
                          onSave={handleSave}
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          }
                        />
                      </div>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(deal.id, deal.company)}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
