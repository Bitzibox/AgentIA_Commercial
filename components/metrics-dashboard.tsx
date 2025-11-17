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
    },
    {
      title: "Leads actifs",
      value: formatNumber(metrics.leads),
      change: metrics.leadsGrowth,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Taux de conversion",
      value: formatPercent(metrics.conversionRate),
      change: metrics.conversionRateChange,
      icon: Target,
      color: "text-purple-600",
    },
    {
      title: "Pipeline",
      value: formatCurrency(metrics.pipelineValue),
      change: metrics.pipelineGrowth,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Deal moyen",
      value: formatCurrency(metrics.averageDealSize),
      change: 0,
      icon: DollarSign,
      color: "text-emerald-600",
    },
    {
      title: "Cycle de vente",
      value: `${metrics.salesCycle}j`,
      change: 0,
      icon: Clock,
      color: "text-pink-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricsCards.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change > 0
        const hasChange = metric.change !== 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={cn("h-4 w-4", metric.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {hasChange && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <TrendIcon
                    className={cn(
                      "h-3 w-3",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}
                  />
                  <span className={isPositive ? "text-green-600" : "text-red-600"}>
                    {isPositive ? "+" : ""}
                    {formatPercent(Math.abs(metric.change))}
                  </span>
                  <span>vs mois dernier</span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
