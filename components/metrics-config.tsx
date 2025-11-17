"use client"

import { useState } from "react"
import { BusinessMetrics } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, TrendingUp } from "lucide-react"

interface MetricsConfigProps {
  metrics: BusinessMetrics
  onSave: (metrics: BusinessMetrics) => void
}

export function MetricsConfig({ metrics, onSave }: MetricsConfigProps) {
  const [formData, setFormData] = useState<BusinessMetrics>(metrics)

  const handleChange = (field: keyof BusinessMetrics, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }))
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>Configuration des Métriques</CardTitle>
        </div>
        <CardDescription>Modifiez les métriques commerciales de votre entreprise</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chiffre d'affaires */}
          <div className="space-y-2">
            <Label htmlFor="revenue">Chiffre d'affaires (€)</Label>
            <Input
              id="revenue"
              type="number"
              value={formData.revenue}
              onChange={(e) => handleChange("revenue", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenueGrowth">Croissance CA (%)</Label>
            <Input
              id="revenueGrowth"
              type="number"
              step="0.1"
              value={formData.revenueGrowth}
              onChange={(e) => handleChange("revenueGrowth", e.target.value)}
            />
          </div>

          {/* Leads */}
          <div className="space-y-2">
            <Label htmlFor="leads">Nombre de leads</Label>
            <Input
              id="leads"
              type="number"
              value={formData.leads}
              onChange={(e) => handleChange("leads", e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Calculé automatiquement depuis les hot leads</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadsGrowth">Croissance leads (%)</Label>
            <Input
              id="leadsGrowth"
              type="number"
              step="0.1"
              value={formData.leadsGrowth}
              onChange={(e) => handleChange("leadsGrowth", e.target.value)}
            />
          </div>

          {/* Taux de conversion */}
          <div className="space-y-2">
            <Label htmlFor="conversionRate">Taux de conversion (%)</Label>
            <Input
              id="conversionRate"
              type="number"
              step="0.1"
              value={formData.conversionRate}
              onChange={(e) => handleChange("conversionRate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversionRateChange">Variation taux de conversion (%)</Label>
            <Input
              id="conversionRateChange"
              type="number"
              step="0.1"
              value={formData.conversionRateChange}
              onChange={(e) => handleChange("conversionRateChange", e.target.value)}
            />
          </div>

          {/* Pipeline */}
          <div className="space-y-2">
            <Label htmlFor="pipelineValue">Valeur du pipeline (€)</Label>
            <Input
              id="pipelineValue"
              type="number"
              value={formData.pipelineValue}
              onChange={(e) => handleChange("pipelineValue", e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Calculé automatiquement depuis les deals</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pipelineGrowth">Croissance pipeline (%)</Label>
            <Input
              id="pipelineGrowth"
              type="number"
              step="0.1"
              value={formData.pipelineGrowth}
              onChange={(e) => handleChange("pipelineGrowth", e.target.value)}
            />
          </div>

          {/* Deal moyen et cycle de vente */}
          <div className="space-y-2">
            <Label htmlFor="averageDealSize">Montant moyen d'un deal (€)</Label>
            <Input
              id="averageDealSize"
              type="number"
              value={formData.averageDealSize}
              onChange={(e) => handleChange("averageDealSize", e.target.value)}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Calculé automatiquement depuis les deals</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesCycle">Cycle de vente (jours)</Label>
            <Input
              id="salesCycle"
              type="number"
              value={formData.salesCycle}
              onChange={(e) => handleChange("salesCycle", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder les métriques
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
