"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { DealsList } from "@/components/deals-list"
import { ActionItems } from "@/components/action-items"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { dataManager } from "@/lib/data-manager"
import { BusinessContext, Deal } from "@/types"
import { BarChart3, MessageSquare, Target, CheckSquare, RefreshCw, Download, Upload } from "lucide-react"

export default function Home() {
  const [businessData, setBusinessData] = useState<BusinessContext | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadData()
  }, [])

  const loadData = () => {
    const data = dataManager.loadData()
    setBusinessData(data)
  }

  const handleAddDeal = (deal: Omit<Deal, "id">) => {
    dataManager.addDeal(deal)
    loadData()
  }

  const handleDeleteDeal = (id: string) => {
    dataManager.deleteDeal(id)
    loadData()
  }

  const handleResetData = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ?")) {
      dataManager.resetToDemo()
      loadData()
    }
  }

  const handleExportData = () => {
    const data = dataManager.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `agent-commercial-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          if (dataManager.importData(content)) {
            loadData()
            alert("Données importées avec succès !")
          } else {
            alert("Erreur lors de l'import des données")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  if (!isClient || !businessData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <ApiKeyDialog />
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Agent Commercial IA
              </h1>
              <p className="text-muted-foreground mt-2">
                Votre copilote intelligent pour booster vos ventes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImportData}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Importer
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetData}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Copilote IA</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Opportunités</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <MetricsDashboard metrics={businessData.metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <DealsList
                deals={businessData.topDeals}
                onAdd={handleAddDeal}
                onDelete={handleDeleteDeal}
              />
              <ActionItems items={businessData.actionItems} />
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="h-[calc(100vh-250px)]">
                  <ChatInterface businessContext={businessData} />
                </div>
              </div>
              <div className="space-y-6">
                <MetricsDashboard metrics={businessData.metrics} />
              </div>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DealsList
                  deals={businessData.topDeals}
                  onAdd={handleAddDeal}
                  onDelete={handleDeleteDeal}
                />
              </div>
              <div className="space-y-6">
                <div className="h-[600px]">
                  <ChatInterface businessContext={businessData} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="grid gap-6 lg:grid-cols-2">
              <ActionItems items={businessData.actionItems} />
              <div className="h-[600px]">
                <ChatInterface businessContext={businessData} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
          <p className="font-medium">
            Agent Commercial IA v2.0 - Propulsé par Google Gemini
          </p>
          <p className="mt-1">
            💾 Vos données sont stockées localement dans votre navigateur
          </p>
          <p className="mt-1 text-xs">
            Hébergé gratuitement sur GitHub Pages
          </p>
        </footer>
      </div>
    </div>
  )
}
