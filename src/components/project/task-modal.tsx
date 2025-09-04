import React from "react"
import { Calendar, User, Tag, Edit, Trash2, Clock, Flag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubTaskManager } from "./subtask-manager"
import { CommentManager } from "./comment-manager"
import { AttachmentManager } from "./attachment-manager"
import { ActivityHistory } from "./activity-history"

interface SubTask {
  id: string
  title: string
  completed: boolean
  assignedTo?: string
  dueDate?: string
}

interface Attachment {
  id: string
  name: string
  url: string
  type: string
  uploadedAt: string
  uploadedBy: string
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  updatedAt?: string
}

interface TimeEntry {
  id: string
  description: string
  startTime: string
  endTime?: string
  duration: number // em minutos
  user: string
  date: string
}

interface Task {
  id: string
  title: string
  description: string
  responsible: string[]
  dueDate: string
  dueTime: string
  tags: string[]
  status: string
  priority: "low" | "medium" | "high" | "urgent"
  subtasks: SubTask[]
  attachments: Attachment[]
  comments: Comment[]
  timeTracking: TimeEntry[]
  createdAt: string
  updatedAt: string
  createdBy: string
  estimatedHours?: number
  actualHours?: number
  clientId?: string
  projectType?: string
}

interface TaskModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onUpdateTask?: (task: Task) => void
}

const TaskModal = React.memo(function TaskModal({ task, open, onOpenChange, onEdit, onDelete, onUpdateTask }: TaskModalProps) {
  console.log('TaskModal rendered with:', { task: task?.title, open })
  
  if (!task) {
    console.log('TaskModal: No task provided, returning null')
    return null
  }

  const getPriorityColor = React.useCallback((priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground animate-pulse"
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "low": return "bg-success text-success-foreground"
      default: return "bg-secondary text-secondary-foreground"
    }
  }, [])

  const getStatusColor = React.useCallback((status: string) => {
    switch (status) {
      case "todo": return "bg-muted text-muted-foreground"
      case "inprogress": return "bg-primary/10 text-primary"
      case "review": return "bg-warning/10 text-warning"
      case "done": return "bg-success/10 text-success"
      default: return "bg-muted text-muted-foreground"
    }
  }, [])

  const getStatusText = React.useCallback((status: string) => {
    switch (status) {
      case "todo": return "A Fazer"
      case "inprogress": return "Em Progresso"
      case "review": return "Em Revisão"
      case "done": return "Concluído"
      default: return status
    }
  }, [])

  const handleUpdateTask = React.useCallback((updatedTask: Task) => {
    if (onUpdateTask) {
      onUpdateTask(updatedTask)
    }
  }, [onUpdateTask])

  return (

    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        style={{ zIndex: 9999 }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground pr-8">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-3">
            <Badge className={`${getStatusColor(task.status)}`}>
              {getStatusText(task.status)}
            </Badge>
            <Badge className={`${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Descrição</h3>
            <p className="text-muted-foreground leading-relaxed">
              {task.description || "Nenhuma descrição fornecida."}
            </p>
          </div>

          <Separator />

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm font-medium">Responsáveis:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.responsible.map((person, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vencimento:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    {task.dueTime && ` às ${task.dueTime}`}
                  </span>
                </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-sm font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {task.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs for different sections */}
          <Tabs defaultValue="subtasks" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subtasks">Sub-tarefas ({task.subtasks?.length || 0})</TabsTrigger>
              <TabsTrigger value="comments">Comentários ({task.comments?.length || 0})</TabsTrigger>
              <TabsTrigger value="attachments">Anexos ({task.attachments?.length || 0})</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subtasks" className="space-y-4">
              <SubTaskManager 
                subtasks={task.subtasks || []}
                onAddSubtask={(title) => {
                  const newSubtask = {
                    id: Date.now().toString(),
                    title,
                    completed: false,
                    createdAt: new Date().toISOString()
                  }
                  const updatedTask = {
                    ...task,
                    subtasks: [...(task.subtasks || []), newSubtask]
                  }
                  handleUpdateTask(updatedTask)
                }}
                onToggleSubtask={(id) => {
                  const updatedSubtasks = (task.subtasks || []).map(st => 
                    st.id === id ? { ...st, completed: !st.completed } : st
                  )
                  const updatedTask = {
                    ...task,
                    subtasks: updatedSubtasks
                  }
                  handleUpdateTask(updatedTask)
                }}
                onDeleteSubtask={(id) => {
                  const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== id)
                  const updatedTask = {
                    ...task,
                    subtasks: updatedSubtasks
                  }
                  handleUpdateTask(updatedTask)
                }}
                onUpdateSubtask={(id, title) => {
                  const updatedSubtasks = (task.subtasks || []).map(st => 
                    st.id === id ? { ...st, title } : st
                  )
                  const updatedTask = {
                    ...task,
                    subtasks: updatedSubtasks
                  }
                  handleUpdateTask(updatedTask)
                }}
              />
            </TabsContent>
            
            <TabsContent value="comments" className="space-y-4">
              <CommentManager 
                task={task} 
                onUpdateTask={handleUpdateTask}
              />
            </TabsContent>
            
            <TabsContent value="attachments" className="space-y-4">
              <AttachmentManager 
                task={task} 
                onUpdateTask={handleUpdateTask}
              />
            </TabsContent>
            
            <TabsContent value="history" className="space-y-4">
              <ActivityHistory task={task} />
            </TabsContent>
          </Tabs>

          {/* Time Tracking */}
          {task.timeTracking && task.timeTracking.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">Controle de Tempo</h3>
              <div className="space-y-2">
                {task.timeTracking.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <span className="text-sm font-medium">{entry.description}</span>
                      <p className="text-xs text-muted-foreground">{entry.user} - {new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">
                      {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {Math.floor(task.timeTracking.reduce((acc, entry) => acc + entry.duration, 0) / 60)}h {task.timeTracking.reduce((acc, entry) => acc + entry.duration, 0) % 60}m
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')} por {task.createdBy}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                className="hover-lift"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="hover-lift"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export { TaskModal }