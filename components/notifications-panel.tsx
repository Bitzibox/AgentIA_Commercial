"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Notification, NotificationEngine } from "@/lib/notifications"
import { BusinessContext } from "@/types"

interface NotificationsPanelProps {
  businessContext: BusinessContext
  onNavigate?: (type: string, id: string) => void
}

export function NotificationsPanel({ businessContext, onNavigate }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [mounted, setMounted] = useState(false)

  // S'assurer que le composant est monté côté client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Générer les notifications au chargement et quand le contexte change
  useEffect(() => {
    const generated = NotificationEngine.generateNotifications(businessContext)
    setNotifications(generated)
  }, [businessContext])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
    }
  }

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-200"
      case "warning":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-200"
      case "success":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-200"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200"
    }
  }

  // Créer le contenu du panneau de notifications
  const notificationsPanel = isOpen && mounted ? (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-start justify-end p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-right duration-300 relative z-[10000]">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 sticky top-0 z-[10001]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} nouvelles
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Tout lire
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Aucune notification</p>
                  <p className="text-sm">Tout est sous contrôle ! 👍</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200",
                      !notification.read
                        ? "bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-700 shadow-md"
                        : "bg-muted/50 border-slate-200 dark:border-slate-700 opacity-70"
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-full shrink-0", getColor(notification.type))}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-sm">{notification.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              dismissNotification(notification.id)
                            }}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground whitespace-pre-line mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getColor(notification.type))}
                          >
                            {notification.category}
                          </Badge>

                          {notification.actionable && onNavigate && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onNavigate(notification.actionable!.type, notification.actionable!.id)
                                setIsOpen(false)
                              }}
                              className="h-auto p-0 text-xs"
                            >
                              {notification.actionable.label} →
                            </Button>
                          )}
                        </div>

                        {!notification.read && (
                          <div className="mt-2 pt-2 border-t">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-6 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
  ) : null

  return (
    <>
      {/* Notification Bell Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Panneau de notifications rendu via Portal au niveau du document */}
      {mounted && notificationsPanel && createPortal(notificationsPanel, document.body)}
    </>
  )
}
