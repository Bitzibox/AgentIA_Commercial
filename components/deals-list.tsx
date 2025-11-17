"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Deal } from "@/types"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { Building2, TrendingUp, Calendar, User } from "lucide-react"

interface DealsListProps {
  deals: Deal[]
}

export function DealsList({ deals }: DealsListProps) {
  const getStageColor = (stage: Deal["stage"]) => {
    const colors = {
      Prospection: "bg-gray-100 text-gray-800 border-gray-300",
      Qualification: "bg-blue-100 text-blue-800 border-blue-300",
      Proposition: "bg-purple-100 text-purple-800 border-purple-300",
      Négociation: "bg-orange-100 text-orange-800 border-orange-300",
      Closing: "bg-green-100 text-green-800 border-green-300",
      Gagné: "bg-emerald-100 text-emerald-800 border-emerald-300",
      Perdu: "bg-red-100 text-red-800 border-red-300",
    }
    return colors[stage]
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 40) return "text-orange-600"
    return "text-gray-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Top Opportunités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-base">{deal.company}</h4>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <User className="h-3 w-3" />
                  {deal.contact}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(deal.value)}</p>
                <p className={cn("text-sm font-medium flex items-center gap-1 justify-end", getProbabilityColor(deal.probability))}>
                  <TrendingUp className="h-3 w-3" />
                  {deal.probability}%
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStageColor(deal.stage)} variant="outline">
                {deal.stage}
              </Badge>
              {deal.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {deal.nextStep && (
              <div className="text-sm bg-muted/50 p-2 rounded">
                <p className="font-medium text-xs text-muted-foreground mb-1">Prochaine étape :</p>
                <p>{deal.nextStep}</p>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Dernière activité : {formatDate(deal.lastActivity)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
