"use client"

import { ChatInterface } from "@/components/chat-interface"
import { MetricsDashboard } from "@/components/metrics-dashboard"
import { DealsList } from "@/components/deals-list"
import { ActionItems } from "@/components/action-items"
import { ApiKeyDialog } from "@/components/api-key-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { demoBusinessContext } from "@/lib/demo-data"
import { BarChart3, MessageSquare, Target, CheckSquare } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <ApiKeyDialog />
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Agent Commercial IA
              </h1>
              <p className="text-muted-foreground mt-2">
                Votre copilote intelligent pour booster vos ventes
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Mode Démo</p>
              <p className="text-xs text-muted-foreground">Données simulées</p>
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
          <TabsContent value="dashboard" className="space-y-6">
            <MetricsDashboard metrics={demoBusinessContext.metrics} />

            <div className="grid gap-6 lg:grid-cols-2">
              <DealsList deals={demoBusinessContext.topDeals} />
              <ActionItems items={demoBusinessContext.actionItems} />
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="h-[calc(100vh-250px)]">
                  <ChatInterface businessContext={demoBusinessContext} />
                </div>
              </div>
              <div className="space-y-6">
                <MetricsDashboard metrics={demoBusinessContext.metrics} />
              </div>
            </div>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DealsList deals={demoBusinessContext.topDeals} />
              </div>
              <div className="space-y-6">
                <div className="h-[600px]">
                  <ChatInterface businessContext={demoBusinessContext} />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <ActionItems items={demoBusinessContext.actionItems} />
              <div className="h-[600px]">
                <ChatInterface businessContext={demoBusinessContext} />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground border-t pt-6">
          <p>
            Agent Commercial IA v2.0 - Propulsé par Google Gemini
          </p>
          <p className="mt-1">
            Hébergé gratuitement sur GitHub Pages
          </p>
        </footer>
      </div>
    </div>
  )
}
