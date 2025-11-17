"use client"

import { useState, useEffect, useCallback } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { ConversationsSidebar } from "@/components/conversations-sidebar"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { DealsList } from "@/components/deals-list"
import { ActionItems } from "@/components/action-items"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { dataManager } from "@/lib/data-manager"
import { conversationManager } from "@/lib/conversation-manager"
import { BusinessContext, Deal, BusinessMetrics, Lead, Activity, ActionItem } from "@/types"
import { BarChart3, MessageSquare, Target, CheckSquare, RefreshCw, Download, Upload, Sparkles, Settings } from "lucide-react"
import { MetricsConfig } from "@/components/metrics-config"
import { LeadsManager } from "@/components/leads-manager"
import { ActivitiesManager } from "@/components/activities-manager"
import { AIInsights } from "@/components/ai-insights"
import { NotificationsPanel } from "@/components/notifications-panel"

export default function Home() {
  const [businessData, setBusinessData] = useState<BusinessContext | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [conversationKey, setConversationKey] = useState(0)

  useEffect(() => {
    setIsClient(true)
    loadData()
    initializeConversation()
  }, [])

  const initializeConversation = () => {
    const conversation = conversationManager.getOrCreateActiveConversation()
    setActiveConversationId(conversation.id)
  }

  const handleNewConversation = useCallback(() => {
    const newConversation = conversationManager.createConversation()
    setActiveConversationId(newConversation.id)
    setConversationKey((prev) => prev + 1) // Force refresh
  }, [])

  const handleConversationChange = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId)
    conversationManager.setActiveConversation(conversationId)
    setConversationKey((prev) => prev + 1) // Force refresh
  }, [])

  const handleConversationUpdate = useCallback(() => {
    setConversationKey((prev) => prev + 1) // Force refresh sidebar
  }, [])

  const loadData = () => {
    const data = dataManager.loadData()
    setBusinessData(data)
  }

  const handleAddDeal = (deal: Omit<Deal, "id">) => {
    dataManager.addDeal(deal)
    loadData()
  }

  const handleUpdateDeal = (id: string, updates: Partial<Deal>) => {
    dataManager.updateDeal(id, updates)
    loadData()
  }

  const handleDeleteDeal = (id: string) => {
    dataManager.deleteDeal(id)
    loadData()
  }

  const handleAddAction = (action: Omit<ActionItem, "id">) => {
    dataManager.addAction(action)
    loadData()
  }

  const handleUpdateAction = (id: string, updates: Partial<ActionItem>) => {
    dataManager.updateAction(id, updates)
    loadData()
  }

  const handleDeleteAction = (id: string) => {
    dataManager.deleteAction(id)
    loadData()
  }

  const handleUpdateMetrics = (metrics: BusinessMetrics) => {
    dataManager.updateMetricsManually(metrics)
    loadData()
  }

  const handleAddLead = (lead: Omit<Lead, "id">) => {
    dataManager.addLead(lead)
    loadData()
  }

  const handleUpdateLead = (id: string, updates: Partial<Lead>) => {
    dataManager.updateLead(id, updates)
    loadData()
  }

  const handleDeleteLead = (id: string) => {
    dataManager.deleteLead(id)
    loadData()
  }

  const handleAddActivity = (activity: Omit<Activity, "id">) => {
    dataManager.addActivity(activity)
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
                {businessData && <NotificationsPanel businessContext={businessData} />}
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-1.5 rounded-xl shadow-md border border-slate-200/50 dark:border-slate-800/50">
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
            <TabsTrigger
              value="config"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* IA Insights en premier */}
            <AIInsights businessContext={businessData} onAddAction={handleAddAction} />

            <MetricsDashboard metrics={businessData.metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <DealsList
                deals={businessData.topDeals}
                businessContext={businessData}
                onAdd={handleAddDeal}
                onUpdate={handleUpdateDeal}
                onDelete={handleDeleteDeal}
              />
              <ActionItems
                items={businessData.actionItems}
                onAdd={handleAddAction}
                onUpdate={handleUpdateAction}
                onDelete={handleDeleteAction}
              />
            </div>
          </TabsContent>

          {/* Chat Tab avec Sidebar */}
          <TabsContent value="chat" className="space-y-6">
            <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[600px]">
              <ConversationsSidebar
                activeConversationId={activeConversationId}
                onConversationChange={handleConversationChange}
                onNewConversation={handleNewConversation}
                key={conversationKey}
              />
              <div className="flex-1 overflow-hidden">
                {activeConversationId && (
                  <ChatInterface
                    businessContext={businessData}
                    conversationId={activeConversationId}
                    onConversationUpdate={handleConversationUpdate}
                    disableAutoScroll={true}
                    key={`chat-${activeConversationId}`}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DealsList
                  deals={businessData.topDeals}
                  businessContext={businessData}
                  onAdd={handleAddDeal}
                  onUpdate={handleUpdateDeal}
                  onDelete={handleDeleteDeal}
                />
              </div>
              <div className="space-y-6">
                <div className="h-[600px]">
                  {activeConversationId && (
                    <ChatInterface
                      businessContext={businessData}
                      conversationId={activeConversationId}
                      onConversationUpdate={handleConversationUpdate}
                      disableAutoScroll={true}
                      key={`chat-deals-${activeConversationId}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ActionItems
                items={businessData.actionItems}
                onAdd={handleAddAction}
                onUpdate={handleUpdateAction}
                onDelete={handleDeleteAction}
              />
              <div className="h-[600px]">
                {activeConversationId && (
                  <ChatInterface
                    businessContext={businessData}
                    conversationId={activeConversationId}
                    onConversationUpdate={handleConversationUpdate}
                    disableAutoScroll={true}
                    key={`chat-actions-${activeConversationId}`}
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="space-y-6">
              {/* Configuration des métriques */}
              <MetricsConfig metrics={businessData.metrics} onSave={handleUpdateMetrics} />

              {/* Gestion des leads */}
              <LeadsManager
                leads={businessData.hotLeads}
                onAdd={handleAddLead}
                onUpdate={handleUpdateLead}
                onDelete={handleDeleteLead}
              />

              {/* Gestion des activités */}
              <ActivitiesManager activities={businessData.recentActivities} onAdd={handleAddActivity} />

              {/* Note sur les deals et actions */}
              <Card className="border-2 border-dashed border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Autres données
                  </CardTitle>
                  <CardDescription>
                    Les opportunités (deals) se gèrent dans l'onglet "Opportunités" et les actions dans
                    l'onglet "Actions"
                  </CardDescription>
                </CardHeader>
              </Card>
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
