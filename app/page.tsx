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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <ApiKeyDialog />
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header avec design amélioré */}
        <header className="mb-6 md:mb-8 animate-in fade-in slide-in-from-top duration-500">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Agent Commercial IA
                  </h1>
                  <p className="text-sm md:text-base text-muted-foreground mt-1">
                    Votre copilote intelligent pour booster vos ventes
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="gap-2 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportData}
                  className="gap-2 hover:bg-purple-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importer</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetData}
                  className="gap-2 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Réinit.</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content avec tabs améliorés */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/50">
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-200"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Copilote IA</span>
            </TabsTrigger>
            <TabsTrigger
              value="deals"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Opportunités</span>
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white transition-all duration-200"
            >
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

        {/* Footer amélioré */}
        <footer className="mt-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-6 shadow-md border border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">
              Agent Commercial IA v2.0
            </p>
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Propulsé par Google Gemini
            </p>
            <p className="text-xs">
              💾 Vos données sont stockées localement dans votre navigateur
            </p>
            <p className="text-xs opacity-70">
              Hébergé gratuitement sur GitHub Pages
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
