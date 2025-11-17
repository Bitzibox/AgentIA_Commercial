"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActionItem } from "@/types"
import { formatDate, cn } from "@/lib/utils"
import { CheckCircle2, Circle, AlertCircle, Clock } from "lucide-react"
import { useState } from "react"

interface ActionItemsProps {
  items: ActionItem[]
}

export function ActionItems({ items: initialItems }: ActionItemsProps) {
  const [items, setItems] = useState(initialItems)

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const getPriorityColor = (priority: ActionItem["priority"]) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-orange-100 text-orange-800 border-orange-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Actions à mener
          </span>
          <Badge variant="secondary">
            {pendingItems.length} en cours
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex gap-3 p-3 border rounded-lg transition-colors",
              item.completed ? "bg-muted/50 opacity-60" : "hover:bg-accent/50"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 mt-0.5"
              onClick={() => toggleComplete(item.id)}
            >
              {item.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>

            <div className="flex-1 space-y-2">
              <div>
                <h4 className={cn("font-medium", item.completed && "line-through")}>
                  {item.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getPriorityColor(item.priority)} variant="outline">
                  {getPriorityLabel(item.priority)}
                </Badge>

                {item.dueDate && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isOverdue(item.dueDate)
                        ? "text-red-600 font-medium"
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
                className="flex gap-3 p-3 bg-muted/50 opacity-60 rounded-lg"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 mt-0.5"
                  onClick={() => toggleComplete(item.id)}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </Button>
                <div className="flex-1">
                  <h4 className="font-medium line-through">{item.title}</h4>
                </div>
              </div>
            ))}
          </>
        )}

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune action en attente</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
