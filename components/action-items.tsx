"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionItem } from "@/types"
import { formatDate, cn } from "@/lib/utils"
import { CheckCircle2, Circle, AlertCircle, Clock, Trash2, Edit } from "lucide-react"
import { ActionDialog } from "@/components/action-dialog"

interface ActionItemsProps {
  items: ActionItem[]
  onAdd?: (action: Omit<ActionItem, "id">) => void
  onUpdate?: (id: string, updates: Partial<ActionItem>) => void
  onDelete?: (id: string) => void
}

export function ActionItems({ items, onAdd, onUpdate, onDelete }: ActionItemsProps) {

  const toggleComplete = (item: ActionItem) => {
    onUpdate?.(item.id, { completed: !item.completed })
  }

  const handleSave = (actionData: Omit<ActionItem, "id"> | ActionItem) => {
    if ("id" in actionData) {
      // Mode édition
      onUpdate?.(actionData.id, actionData)
    } else {
      // Mode création
      onAdd?.(actionData)
    }
  }

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'action "${title}" ?`)) {
      onDelete?.(id)
    }
  }

  const getPriorityColor = (priority: ActionItem["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200",
      medium: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200",
      low: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200",
    }
    return colors[priority]
  }

  const getPriorityLabel = (priority: ActionItem["priority"]) => {
    const labels = {
      high: "Urgent",
      medium: "Moyen",
      low: "Faible",
    }
    return labels[priority]
  }

  const isOverdue = (dueDate?: Date) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const pendingItems = items.filter((item) => !item.completed)
  const completedItems = items.filter((item) => item.completed)

  return (
    <Card className="shadow-xl border-2 border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-950/50 dark:to-pink-950/50 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">Actions à mener</div>
              <div className="text-sm font-normal text-muted-foreground">
                {pendingItems.length} en cours
              </div>
            </div>
          </CardTitle>
          {onAdd && <ActionDialog onSave={handleSave} />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-6">
        {pendingItems.length === 0 && completedItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">Aucune action</p>
            <p className="text-sm">Ajoutez votre première action pour commencer</p>
          </div>
        ) : (
          <>
            {pendingItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex gap-3 p-4 border-2 rounded-xl transition-all duration-300",
                  "bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50",
                  "hover:border-purple-400 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-purple-100/50 dark:hover:shadow-pink-900/20",
                  "animate-in slide-in-from-bottom-3",
                  "border-slate-200 dark:border-slate-700"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 mt-0.5"
                  onClick={() => toggleComplete(item)}
                >
                  <Circle className="h-5 w-5" />
                </Button>

                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-bold text-base">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)} variant="outline">
                      {getPriorityLabel(item.priority)}
                    </Badge>

                    {item.dueDate && (
                      <div
                        className={cn(
                          "flex items-center gap-1 text-xs px-2 py-1 rounded",
                          isOverdue(item.dueDate)
                            ? "text-red-600 font-medium bg-red-50 dark:bg-red-950"
                            : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatDate(item.dueDate)}
                        {isOverdue(item.dueDate) && " (En retard)"}
                      </div>
                    )}

                    {item.relatedTo && (
                      <Badge variant="secondary" className="text-xs">
                        {item.relatedTo.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {(onUpdate || onDelete) && (
                  <div className="flex gap-1 shrink-0">
                    {onUpdate && (
                      <ActionDialog
                        action={item}
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
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {completedItems.length > 0 && (
              <>
                <div className="border-t pt-3 mt-4">
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Complétées ({completedItems.length})
                  </p>
                </div>
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-muted/50 opacity-60 rounded-lg border"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 mt-0.5"
                      onClick={() => toggleComplete(item)}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </Button>
                    <div className="flex-1">
                      <h4 className="font-medium line-through">{item.title}</h4>
                    </div>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
