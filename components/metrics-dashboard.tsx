"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Clock } from "lucide-react"
import { BusinessMetrics } from "@/types"
import { formatCurrency, formatNumber, formatPercent, cn } from "@/lib/utils"

interface MetricsDashboardProps {
  metrics: BusinessMetrics
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const metricsCards = [
    {
      title: "Chiffre d'affaires",
      value: formatCurrency(metrics.revenue),
      change: metrics.revenueGrowth,
      icon: DollarSign,
      color: "text-green-600",
      bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    },
    {
      title: "Leads actifs",
      value: formatNumber(metrics.leads),
      change: metrics.leadsGrowth,
      icon: Users,
      color: "text-blue-600",
      bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    },
    {
      title: "Taux de conversion",
      value: formatPercent(metrics.conversionRate),
      change: metrics.conversionRateChange,
      icon: Target,
      color: "text-purple-600",
      bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
    },
    {
      title: "Pipeline",
      value: formatCurrency(metrics.pipelineValue),
      change: metrics.pipelineGrowth,
      icon: TrendingUp,
      color: "text-orange-600",
      bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
    },
    {
      title: "Deal moyen",
      value: formatCurrency(metrics.averageDealSize),
      change: 0,
      icon: DollarSign,
      color: "text-emerald-600",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    },
    {
      title: "Cycle de vente",
      value: `${metrics.salesCycle}j`,
      change: 0,
      icon: Clock,
      color: "text-pink-600",
      bgGradient: "from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {metricsCards.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change > 0
        const hasChange = metric.change !== 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card
            key={index}
            className="relative overflow-hidden border-2 border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Gradient de fond */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", metric.bgGradient)} />

            {/* Contenu */}
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3 px-4 pt-4">
              <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide truncate pr-2">
                {metric.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl", metric.color, "bg-opacity-10 shrink-0")}>
                <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", metric.color)} />
              </div>
            </CardHeader>

            <CardContent className="relative px-4 pb-4">
              {/* Valeur principale - Taille réduite pour tenir sur une ligne */}
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2 leading-tight">
                {metric.value}
              </div>

              {/* Indicateur de tendance */}
              {hasChange && (
                <div className="flex items-center gap-1.5 text-sm flex-wrap">
                  <TrendIcon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}
                  />
                  <span className={cn(
                    "font-semibold whitespace-nowrap",
                    isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {isPositive ? "+" : ""}
                    {formatPercent(Math.abs(metric.change))}
                  </span>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">vs mois dernier</span>
                </div>
              )}

              {/* Espace pour les cartes sans changement */}
              {!hasChange && <div className="h-6"></div>}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
