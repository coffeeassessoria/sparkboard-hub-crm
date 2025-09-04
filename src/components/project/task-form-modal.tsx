import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

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
  duration: number
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

interface TaskFormModalProps {
  task?: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Partial<Task>) => void
}

export default function TaskFormModal({ task, open, onOpenChange, onSave }: TaskFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    responsible: [] as string[],
    dueDate: "",
    dueTime: "",
    tags: [] as string[],
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    estimatedHours: 0
  })
  const [newTag, setNewTag] = useState('')
  const [newResponsible, setNewResponsible] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        responsible: task.responsible,
        dueDate: task.dueDate,
        dueTime: task.dueTime,
        tags: task.tags,
        priority: task.priority,
        estimatedHours: task.estimatedHours || 0
      })
    } else {
      setFormData({
        title: "",
        description: "",
        responsible: [],
        dueDate: "",
        dueTime: "",
        tags: [],
        priority: "medium",
        estimatedHours: 0
      })
    }
  }, [task, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    
    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Horas estimadas não podem ser negativas'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const now = new Date().toISOString()
      const taskData = {
        ...formData,
        id: task?.id || `task-${Date.now()}`,
        status: task?.status || "todo",
        subtasks: task?.subtasks || [],
        attachments: task?.attachments || [],
        comments: task?.comments || [],
        timeTracking: task?.timeTracking || [],
        createdAt: task?.createdAt || now,
        updatedAt: now,
        createdBy: task?.createdBy || "Current User",
        actualHours: task?.actualHours || 0
      }
      
      await onSave(taskData)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addResponsible = () => {
    if (newResponsible.trim() && !formData.responsible.includes(newResponsible.trim())) {
      setFormData(prev => ({
        ...prev,
        responsible: [...prev.responsible, newResponsible.trim()]
      }))
      setNewResponsible("")
    }
  }

  const removeResponsible = (personToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      responsible: prev.responsible.filter(person => person !== personToRemove)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Digite o título da tarefa"
              required
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a tarefa em detalhes"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueTime">Horário</Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high" | "urgent") => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Horas Estimadas</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Responsáveis</Label>
            <div className="flex gap-2">
              <Input
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                placeholder="Nome do responsável"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsible())}
              />
              <Button type="button" onClick={addResponsible} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.responsible.map((person, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {person}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeResponsible(person)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nova tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (task ? "Salvar Alterações" : "Criar Tarefa")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}