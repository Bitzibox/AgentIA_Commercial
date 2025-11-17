"use client"

import { Deal } from "@/types"
import { AIInsightsEngine } from "@/lib/ai-insights"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, AlertTriangle, Clock, Lightbulb, Building2 } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"

interface DealAnalysisProps {
  deal: Deal
  allDeals: Deal[]
}

export function DealAnalysis({ deal, allDeals }: DealAnalysisProps) {
  const analysis = AIInsightsEngine.analyzeDeal(deal, allDeals)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950/20"
      default:
        return "text-green-600 bg-green-50 dark:bg-green-950/20"
    }
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "high":
        return "Élevé"
      case "medium":
        return "Moyen"
      default:
        return "Faible"
    }
  }

  return (
    <Card className="border-2 border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-br from-purple-50/30 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-base">Analyse IA du deal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Probabilité de closing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Probabilité de closing
            </span>
            <span className="font-bold text-purple-600">{analysis.closingProbability}%</span>
          </div>
          <Progress value={analysis.closingProbability} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Ajusté selon l'activité récente et la phase du deal
          </p>
        </div>

        {/* Temps estimé */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Temps estimé avant closing</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{analysis.estimatedDays} jours</p>
          <p className="text-xs text-muted-foreground mt-1">
            Basé sur la phase actuelle du pipeline
          </p>
        </div>

        {/* Risque de perte */}
        <div className={cn("p-3 rounded-lg border", getRiskColor(analysis.riskLevel))}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Risque de perte</span>
          </div>
          <p className="text-2xl font-bold">{getRiskLabel(analysis.riskLevel)}</p>
        </div>

        {/* Recommandation */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            💡 Recommandation IA
          </h4>
          <p className="text-sm leading-relaxed">{analysis.recommendation}</p>
        </div>

        {/* Deals similaires */}
        {analysis.similarDeals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              Deals similaires
            </h4>
            {analysis.similarDeals.map((similarDeal) => (
              <div
                key={similarDeal.id}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{similarDeal.company}</span>
                  <Badge variant="outline" className="text-xs">
                    {similarDeal.stage}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(similarDeal.value)} • {similarDeal.probability}% de réussite
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
