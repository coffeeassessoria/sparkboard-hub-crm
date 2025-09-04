import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Settings, Trash2, Zap, Bell, Clock, Users, Tag } from "lucide-react"

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: 'task_created' | 'task_updated' | 'task_completed' | 'due_date_approaching' | 'status_changed'
    conditions: {
      field: string
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals'
      value: string
    }[]
  }
  actions: {
    type: 'send_notification' | 'assign_user' | 'change_status' | 'add_tag' | 'send_email'
    parameters: Record<string, any>
  }[]
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

interface AutomationManagerProps {
  projectId: string
}

export function AutomationManager({ projectId }: AutomationManagerProps) {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: 'auto-1',
      name: 'Notificar Prazo Próximo',
      description: 'Envia notificação quando uma tarefa está próxima do prazo',
      trigger: {
        type: 'due_date_approaching',
        conditions: [
          { field: 'dueDate', operator: 'less_than', value: '24' } // 24 horas
        ]
      },
      actions: [
        {
          type: 'send_notification',
          parameters: {
            message: 'Tarefa {{taskTitle}} vence em menos de 24 horas!',
            recipients: ['responsible']
          }
        }
      ],
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      triggerCount: 12
    },
    {
      id: 'auto-2',
      name: 'Auto-atribuir Tarefas Urgentes',
      description: 'Atribui automaticamente tarefas urgentes ao gerente do projeto',
      trigger: {
        type: 'task_created',
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' }
        ]
      },
      actions: [
        {
          type: 'assign_user',
          parameters: {
            userId: 'manager-1',
            userName: 'Gerente do Projeto'
          }
        },
        {
          type: 'send_notification',
          parameters: {
            message: 'Nova tarefa urgente criada: {{taskTitle}}',
            recipients: ['manager-1']
          }
        }
      ],
      isActive: true,
      createdAt: '2024-01-10T14:30:00Z',
      triggerCount: 5
    }
  ])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingAutomations, setDeletingAutomations] = useState<Set<string>>(new Set())
  const [newAutomation, setNewAutomation] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: {
      type: 'task_created',
      conditions: []
    },
    actions: [],
    isActive: true
  })

  const triggerTypes = [
    { value: 'task_created', label: 'Tarefa Criada', icon: Plus },
    { value: 'task_updated', label: 'Tarefa Atualizada', icon: Settings },
    { value: 'task_completed', label: 'Tarefa Concluída', icon: Zap },
    { value: 'due_date_approaching', label: 'Prazo Próximo', icon: Clock },
    { value: 'status_changed', label: 'Status Alterado', icon: Settings }
  ]

  const actionTypes = [
    { value: 'send_notification', label: 'Enviar Notificação', icon: Bell },
    { value: 'assign_user', label: 'Atribuir Usuário', icon: Users },
    { value: 'change_status', label: 'Alterar Status', icon: Settings },
    { value: 'add_tag', label: 'Adicionar Tag', icon: Tag },
    { value: 'send_email', label: 'Enviar Email', icon: Bell }
  ]

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id ? { ...auto, isActive: !auto.isActive } : auto
    ))
  }

  const deleteAutomation = async (id: string) => {
    setDeletingAutomations(prev => new Set(prev).add(id))
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400))
      setAutomations(prev => prev.filter(auto => auto.id !== id))
    } catch (error) {
      console.error('Erro ao excluir automação:', error)
    } finally {
      setDeletingAutomations(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const createAutomation = () => {
    if (!newAutomation.name || !newAutomation.description) return

    const automation: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: newAutomation.name,
      description: newAutomation.description,
      trigger: newAutomation.trigger!,
      actions: newAutomation.actions || [],
      isActive: newAutomation.isActive || true,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    }

    setAutomations(prev => [...prev, automation])
    setIsCreateModalOpen(false)
    setNewAutomation({
      name: '',
      description: '',
      trigger: {
        type: 'task_created',
        conditions: []
      },
      actions: [],
      isActive: true
    })
  }

  const getTriggerIcon = (type: string) => {
    const triggerType = triggerTypes.find(t => t.value === type)
    return triggerType?.icon || Settings
  }

  const getActionIcon = (type: string) => {
    const actionType = actionTypes.find(a => a.value === type)
    return actionType?.icon || Bell
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Automações</h3>
          <p className="text-sm text-muted-foreground">
            Configure regras automáticas para otimizar seu fluxo de trabalho
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Automação</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Automação</Label>
                <Input
                  id="name"
                  value={newAutomation.name || ''}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Notificar prazo próximo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newAutomation.description || ''}
                  onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o que esta automação faz"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Gatilho</Label>
                <Select
                  value={newAutomation.trigger?.type}
                  onValueChange={(value: any) => setNewAutomation(prev => ({
                    ...prev,
                    trigger: { ...prev.trigger!, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gatilho" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map(trigger => {
                      const Icon = trigger.icon
                      return (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {trigger.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={newAutomation.isActive}
                  onCheckedChange={(checked) => setNewAutomation(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="active">Ativar automação</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createAutomation}>
                  Criar Automação
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {automations.map(automation => {
          const TriggerIcon = getTriggerIcon(automation.trigger.type)
          
          return (
            <Card key={automation.id} className={`transition-all duration-200 hover:shadow-md ${automation.isActive ? 'border-success/30 bg-success/5' : 'border-muted bg-muted/20'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${automation.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      <TriggerIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{automation.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {automation.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={automation.isActive ? 'default' : 'secondary'}>
                      {automation.isActive ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Switch
                      checked={automation.isActive}
                      onCheckedChange={() => toggleAutomation(automation.id)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAutomation(automation.id)}
                      disabled={deletingAutomations.has(automation.id)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Gatilho:</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TriggerIcon className="w-4 h-4" />
                      {triggerTypes.find(t => t.value === automation.trigger.type)?.label}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Ações ({automation.actions.length}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {automation.actions.map((action, index) => {
                        const ActionIcon = getActionIcon(action.type)
                        return (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <ActionIcon className="w-3 h-3" />
                            {actionTypes.find(a => a.value === action.type)?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Executada {automation.triggerCount} vezes</span>
                    <span>Criada em {new Date(automation.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {automations.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma automação configurada</h3>
            <p className="text-muted-foreground mb-4">
              Crie automações para otimizar seu fluxo de trabalho
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Automação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}