import React from "react"
import { Clock, User, Edit, Plus, Trash2, CheckCircle, AlertCircle, MessageSquare, Paperclip } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ActivityEntry {
  id: string
  type: 'created' | 'updated' | 'status_changed' | 'comment_added' | 'attachment_added' | 'subtask_added' | 'subtask_completed' | 'assigned' | 'priority_changed'
  user: string
  timestamp: string
  details: {
    field?: string
    oldValue?: string
    newValue?: string
    description?: string
    [key: string]: any
  }
}

interface ActivityHistoryProps {
  activities: ActivityEntry[]
  maxEntries?: number
}

export function ActivityHistory({ activities, maxEntries = 50 }: ActivityHistoryProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      })
    } catch {
      return 'Data inválida'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Plus className="h-4 w-4 text-success" />
      case 'updated':
        return <Edit className="h-4 w-4 text-primary" />
      case 'status_changed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'comment_added':
        return <MessageSquare className="h-4 w-4 text-warning" />
      case 'attachment_added':
        return <Paperclip className="h-4 w-4 text-muted-foreground" />
      case 'subtask_added':
        return <Plus className="h-4 w-4 text-primary" />
      case 'subtask_completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'assigned':
        return <User className="h-4 w-4 text-secondary" />
      case 'priority_changed':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityDescription = (activity: ActivityEntry) => {
    const { type, user, details } = activity
    
    switch (type) {
      case 'created':
        return `${user} criou a tarefa`
      
      case 'updated':
        if (details.field && details.oldValue && details.newValue) {
          const fieldNames: { [key: string]: string } = {
            title: 'título',
            description: 'descrição',
            dueDate: 'data de vencimento',
            dueTime: 'horário de vencimento',
            estimatedHours: 'horas estimadas'
          }
          const fieldName = fieldNames[details.field] || details.field
          return `${user} alterou ${fieldName} de "${details.oldValue}" para "${details.newValue}"`
        }
        return `${user} atualizou a tarefa`
      
      case 'status_changed':
        return `${user} moveu a tarefa para "${details.newValue}"`
      
      case 'comment_added':
        return `${user} adicionou um comentário`
      
      case 'attachment_added':
        return `${user} anexou o arquivo "${details.fileName || 'arquivo'}"`
      
      case 'subtask_added':
        return `${user} adicionou a sub-tarefa "${details.subtaskTitle}"`
      
      case 'subtask_completed':
        return `${user} ${details.completed ? 'concluiu' : 'reabriu'} a sub-tarefa "${details.subtaskTitle}"`
      
      case 'assigned':
        if (details.added && details.removed) {
          return `${user} alterou responsáveis: removeu ${details.removed.join(', ')} e adicionou ${details.added.join(', ')}`
        } else if (details.added) {
          return `${user} atribuiu a tarefa para ${details.added.join(', ')}`
        } else if (details.removed) {
          return `${user} removeu ${details.removed.join(', ')} da tarefa`
        }
        return `${user} alterou os responsáveis`
      
      case 'priority_changed':
        const priorityNames: { [key: string]: string } = {
          low: 'Baixa',
          medium: 'Média',
          high: 'Alta',
          urgent: 'Urgente'
        }
        const oldPriority = priorityNames[details.oldValue] || details.oldValue
        const newPriority = priorityNames[details.newValue] || details.newValue
        return `${user} alterou a prioridade de ${oldPriority} para ${newPriority}`
      
      default:
        return `${user} realizou uma ação`
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive'
      case 'high': return 'bg-accent/10 text-accent-foreground'
      case 'medium': return 'bg-warning/10 text-warning'
      case 'low': return 'bg-success/10 text-success'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const displayedActivities = activities.slice(0, maxEntries)

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <h4 className="font-medium">Histórico de Atividades ({activities.length})</h4>
          
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhuma atividade registrada ainda.
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {displayedActivities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(activity.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">{getActivityDescription(activity)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional details for specific activity types */}
                    {activity.type === 'priority_changed' && activity.details.newValue && (
                      <div className="ml-8">
                        <Badge className={getPriorityColor(activity.details.newValue)}>
                          {activity.details.newValue === 'urgent' ? 'Urgente' :
                           activity.details.newValue === 'high' ? 'Alta' :
                           activity.details.newValue === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                    )}
                    
                    {activity.type === 'comment_added' && activity.details.commentPreview && (
                      <div className="ml-8 p-2 bg-gray-50 rounded text-xs text-muted-foreground">
                        "{activity.details.commentPreview.substring(0, 100)}..."
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {activities.length > maxEntries && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {maxEntries} de {activities.length} atividades
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}