import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, Clock, AlertTriangle, Info, Zap, X, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'automation'
  title: string
  message: string
  taskId?: string
  taskTitle?: string
  projectId?: string
  isRead: boolean
  createdAt: string
  automationRuleId?: string
  automationRuleName?: string
}

interface NotificationCenterProps {
  projectId?: string
}

export function NotificationCenter({ projectId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'notif-1',
      type: 'automation',
      title: 'Prazo Próximo',
      message: 'A tarefa "Revisar design da homepage" vence em 2 horas',
      taskId: 'task-1',
      taskTitle: 'Revisar design da homepage',
      projectId: 'proj-1',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      automationRuleId: 'auto-1',
      automationRuleName: 'Notificar Prazo Próximo'
    },
    {
      id: 'notif-2',
      type: 'automation',
      title: 'Tarefa Urgente Atribuída',
      message: 'Nova tarefa urgente "Corrigir bug crítico" foi atribuída automaticamente',
      taskId: 'task-2',
      taskTitle: 'Corrigir bug crítico',
      projectId: 'proj-1',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
      automationRuleId: 'auto-2',
      automationRuleName: 'Auto-atribuir Tarefas Urgentes'
    },
    {
      id: 'notif-3',
      type: 'success',
      title: 'Tarefa Concluída',
      message: 'A tarefa "Implementar login" foi marcada como concluída',
      taskId: 'task-3',
      taskTitle: 'Implementar login',
      projectId: 'proj-1',
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
    },
    {
      id: 'notif-4',
      type: 'warning',
      title: 'Tarefa Atrasada',
      message: 'A tarefa "Criar documentação" está 2 dias atrasada',
      taskId: 'task-4',
      taskTitle: 'Criar documentação',
      projectId: 'proj-1',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
    },
    {
      id: 'notif-5',
      type: 'info',
      title: 'Novo Comentário',
      message: 'João Silva adicionou um comentário na tarefa "Revisar código"',
      taskId: 'task-5',
      taskTitle: 'Revisar código',
      projectId: 'proj-1',
      isRead: true,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 dias atrás
    }
  ])

  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'automation':
        return Zap
      case 'warning':
        return AlertTriangle
      case 'success':
        return Check
      case 'info':
      default:
        return Info
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'automation':
        return 'text-secondary bg-secondary/10'
      case 'warning':
        return 'text-destructive bg-destructive/10'
      case 'success':
        return 'text-success bg-success/10'
      case 'info':
      default:
        return 'text-primary bg-primary/10'
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'automation':
        return 'secondary'
      case 'warning':
        return 'destructive'
      case 'success':
        return 'default'
      case 'info':
      default:
        return 'outline'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ))
  }

  const markAsUnread = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, isRead: false } : notif
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Filtrar notificações por projeto se projectId for fornecido
  const filteredNotifications = projectId 
    ? notifications.filter(n => n.projectId === projectId)
    : notifications

  // Ordenar por data (mais recentes primeiro) e depois por status (não lidas primeiro)
  const sortedNotifications = filteredNotifications.sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </DialogTitle>
            {notifications.length > 0 && (
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas como lidas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  Limpar todas
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 pt-4 space-y-3">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma notificação</h3>
                <p className="text-muted-foreground text-sm">
                  Você está em dia! Não há notificações pendentes.
                </p>
              </div>
            ) : (
              sortedNotifications.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type)
                const colorClass = getNotificationColor(notification.type)
                
                return (
                  <div key={notification.id}>
                    <Card className={`transition-all hover:shadow-sm ${
                      notification.isRead ? 'opacity-60' : 'border-l-4 border-l-blue-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                                {notification.taskTitle && (
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {notification.taskTitle}
                                  </Badge>
                                )}
                                {notification.automationRuleName && (
                                  <Badge variant="secondary" className="mt-2 ml-2 text-xs">
                                    <Zap className="w-3 h-3 mr-1" />
                                    {notification.automationRuleName}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  {notification.isRead ? (
                                    <Mail className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive/80 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    {index < sortedNotifications.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

// Hook para adicionar novas notificações
export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    // Em uma implementação real, isso seria conectado ao estado global ou API
    console.log('Nova notificação:', notification)
  }

  return { addNotification }
}