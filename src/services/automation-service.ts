import { differenceInHours, differenceInDays, parseISO } from 'date-fns'

// Interfaces para o sistema de automação
interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  responsible?: string
  dueDate?: string
  dueTime?: string
  tags: string[]
  projectId: string
  createdAt: string
  updatedAt: string
}

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

interface AutomationContext {
  task: Task
  previousTask?: Task // Para comparar mudanças
  user?: {
    id: string
    name: string
    email: string
  }
  project?: {
    id: string
    name: string
    managerId?: string
  }
}

class AutomationService {
  private rules: AutomationRule[] = []
  private notifications: Notification[] = []
  private notificationCallbacks: ((notification: Notification) => void)[] = []

  constructor() {
    // Inicializar com regras padrão
    this.initializeDefaultRules()
    
    // Verificar automações baseadas em tempo a cada minuto
    setInterval(() => {
      this.checkTimeBasedAutomations()
    }, 60000) // 1 minuto
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: 'auto-due-date-24h',
        name: 'Notificar Prazo Próximo (24h)',
        description: 'Envia notificação quando uma tarefa está próxima do prazo (24 horas)',
        trigger: {
          type: 'due_date_approaching',
          conditions: [
            { field: 'dueDate', operator: 'less_than', value: '24' }
          ]
        },
        actions: [
          {
            type: 'send_notification',
            parameters: {
              title: 'Prazo Próximo',
              message: 'A tarefa "{{taskTitle}}" vence em menos de 24 horas',
              type: 'warning'
            }
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        triggerCount: 0
      },
      {
        id: 'auto-urgent-assign',
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
              role: 'manager'
            }
          },
          {
            type: 'send_notification',
            parameters: {
              title: 'Tarefa Urgente Atribuída',
              message: 'Nova tarefa urgente "{{taskTitle}}" foi atribuída automaticamente',
              type: 'automation'
            }
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        triggerCount: 0
      },
      {
        id: 'auto-overdue-warning',
        name: 'Alerta de Tarefa Atrasada',
        description: 'Envia alerta quando uma tarefa está atrasada',
        trigger: {
          type: 'due_date_approaching',
          conditions: [
            { field: 'dueDate', operator: 'less_than', value: '0' }
          ]
        },
        actions: [
          {
            type: 'send_notification',
            parameters: {
              title: 'Tarefa Atrasada',
              message: 'A tarefa "{{taskTitle}}" está atrasada',
              type: 'warning'
            }
          },
          {
            type: 'add_tag',
            parameters: {
              tag: 'atrasada'
            }
          }
        ],
        isActive: true,
        createdAt: new Date().toISOString(),
        triggerCount: 0
      }
    ]
  }

  // Registrar callback para notificações
  onNotification(callback: (notification: Notification) => void) {
    this.notificationCallbacks.push(callback)
  }

  // Executar automações quando uma tarefa é criada
  async onTaskCreated(task: Task, context: AutomationContext) {
    await this.executeAutomations('task_created', context)
  }

  // Executar automações quando uma tarefa é atualizada
  async onTaskUpdated(task: Task, previousTask: Task, context: AutomationContext) {
    const contextWithPrevious = { ...context, previousTask }
    
    // Verificar se o status mudou
    if (task.status !== previousTask.status) {
      await this.executeAutomations('status_changed', contextWithPrevious)
    }
    
    // Verificar se a tarefa foi concluída
    if (task.status === 'done' && previousTask.status !== 'done') {
      await this.executeAutomations('task_completed', contextWithPrevious)
    }
    
    await this.executeAutomations('task_updated', contextWithPrevious)
  }

  // Verificar automações baseadas em tempo
  private async checkTimeBasedAutomations() {
    // Em uma implementação real, isso buscaria todas as tarefas do banco de dados
    // Por agora, vamos simular com algumas tarefas
    const tasks = await this.getAllActiveTasks()
    
    for (const task of tasks) {
      const context: AutomationContext = { task }
      await this.executeAutomations('due_date_approaching', context)
    }
  }

  // Simular busca de tarefas ativas (em uma implementação real, viria do banco de dados)
  private async getAllActiveTasks(): Promise<Task[]> {
    // Retornar array vazio por enquanto - em uma implementação real,
    // isso buscaria tarefas do banco de dados
    return []
  }

  // Executar automações para um tipo de gatilho específico
  private async executeAutomations(triggerType: string, context: AutomationContext) {
    const activeRules = this.rules.filter(rule => 
      rule.isActive && rule.trigger.type === triggerType
    )

    for (const rule of activeRules) {
      if (await this.evaluateConditions(rule.trigger.conditions, context)) {
        await this.executeActions(rule.actions, context, rule)
        
        // Atualizar contador de execuções
        rule.triggerCount++
        rule.lastTriggered = new Date().toISOString()
      }
    }
  }

  // Avaliar condições da automação
  private async evaluateConditions(
    conditions: AutomationRule['trigger']['conditions'],
    context: AutomationContext
  ): Promise<boolean> {
    if (conditions.length === 0) return true

    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, context)) {
        return false
      }
    }
    
    return true
  }

  // Avaliar uma condição específica
  private async evaluateCondition(
    condition: AutomationRule['trigger']['conditions'][0],
    context: AutomationContext
  ): Promise<boolean> {
    const { task } = context
    let fieldValue: any

    // Obter valor do campo
    switch (condition.field) {
      case 'priority':
        fieldValue = task.priority
        break
      case 'status':
        fieldValue = task.status
        break
      case 'responsible':
        fieldValue = task.responsible
        break
      case 'dueDate':
        if (!task.dueDate) return false
        
        // Para dueDate, calcular diferença em horas
        const dueDate = parseISO(task.dueDate + (task.dueTime ? `T${task.dueTime}` : 'T23:59'))
        const now = new Date()
        const hoursUntilDue = differenceInHours(dueDate, now)
        fieldValue = hoursUntilDue
        break
      case 'tags':
        fieldValue = task.tags.join(',')
        break
      default:
        return false
    }

    // Avaliar operador
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'contains':
        return String(fieldValue).includes(condition.value)
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      default:
        return false
    }
  }

  // Executar ações da automação
  private async executeActions(
    actions: AutomationRule['actions'],
    context: AutomationContext,
    rule: AutomationRule
  ) {
    for (const action of actions) {
      await this.executeAction(action, context, rule)
    }
  }

  // Executar uma ação específica
  private async executeAction(
    action: AutomationRule['actions'][0],
    context: AutomationContext,
    rule: AutomationRule
  ) {
    const { task } = context

    switch (action.type) {
      case 'send_notification':
        await this.sendNotification(action.parameters, context, rule)
        break
      
      case 'assign_user':
        await this.assignUser(action.parameters, context)
        break
      
      case 'change_status':
        await this.changeTaskStatus(action.parameters, context)
        break
      
      case 'add_tag':
        await this.addTag(action.parameters, context)
        break
      
      case 'send_email':
        await this.sendEmail(action.parameters, context)
        break
    }
  }

  // Enviar notificação
  private async sendNotification(
    parameters: Record<string, any>,
    context: AutomationContext,
    rule: AutomationRule
  ) {
    const { task } = context
    
    // Substituir variáveis na mensagem
    const message = this.replaceVariables(parameters.message || '', context)
    const title = this.replaceVariables(parameters.title || '', context)
    
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: parameters.type || 'automation',
      title,
      message,
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      isRead: false,
      createdAt: new Date().toISOString(),
      automationRuleId: rule.id,
      automationRuleName: rule.name
    }
    
    this.notifications.push(notification)
    
    // Notificar callbacks
    this.notificationCallbacks.forEach(callback => callback(notification))
  }

  // Atribuir usuário
  private async assignUser(parameters: Record<string, any>, context: AutomationContext) {
    const { task, project } = context
    
    if (parameters.role === 'manager' && project?.managerId) {
      // Em uma implementação real, isso atualizaria a tarefa no banco de dados
      console.log(`Atribuindo tarefa ${task.id} ao gerente ${project.managerId}`)
    } else if (parameters.userId) {
      console.log(`Atribuindo tarefa ${task.id} ao usuário ${parameters.userId}`)
    }
  }

  // Alterar status da tarefa
  private async changeTaskStatus(parameters: Record<string, any>, context: AutomationContext) {
    const { task } = context
    
    if (parameters.status) {
      // Em uma implementação real, isso atualizaria a tarefa no banco de dados
      console.log(`Alterando status da tarefa ${task.id} para ${parameters.status}`)
    }
  }

  // Adicionar tag
  private async addTag(parameters: Record<string, any>, context: AutomationContext) {
    const { task } = context
    
    if (parameters.tag && !task.tags.includes(parameters.tag)) {
      // Em uma implementação real, isso atualizaria a tarefa no banco de dados
      console.log(`Adicionando tag '${parameters.tag}' à tarefa ${task.id}`)
    }
  }

  // Enviar email
  private async sendEmail(parameters: Record<string, any>, context: AutomationContext) {
    const { task } = context
    
    // Em uma implementação real, isso enviaria um email
    console.log(`Enviando email sobre tarefa ${task.id}:`, parameters)
  }

  // Substituir variáveis na mensagem
  private replaceVariables(template: string, context: AutomationContext): string {
    const { task, user, project } = context
    
    return template
      .replace(/{{taskTitle}}/g, task.title)
      .replace(/{{taskId}}/g, task.id)
      .replace(/{{taskStatus}}/g, task.status)
      .replace(/{{taskPriority}}/g, task.priority)
      .replace(/{{userName}}/g, user?.name || 'Usuário')
      .replace(/{{projectName}}/g, project?.name || 'Projeto')
  }

  // Métodos públicos para gerenciar regras
  getRules(): AutomationRule[] {
    return [...this.rules]
  }

  addRule(rule: Omit<AutomationRule, 'id' | 'createdAt' | 'triggerCount'>): AutomationRule {
    const newRule: AutomationRule = {
      ...rule,
      id: `auto-${Date.now()}`,
      createdAt: new Date().toISOString(),
      triggerCount: 0
    }
    
    this.rules.push(newRule)
    return newRule
  }

  updateRule(id: string, updates: Partial<AutomationRule>): boolean {
    const index = this.rules.findIndex(rule => rule.id === id)
    if (index === -1) return false
    
    this.rules[index] = { ...this.rules[index], ...updates }
    return true
  }

  deleteRule(id: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === id)
    if (index === -1) return false
    
    this.rules.splice(index, 1)
    return true
  }

  toggleRule(id: string): boolean {
    const rule = this.rules.find(rule => rule.id === id)
    if (!rule) return false
    
    rule.isActive = !rule.isActive
    return true
  }

  // Métodos para notificações
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  markNotificationAsRead(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id)
    if (!notification) return false
    
    notification.isRead = true
    return true
  }

  deleteNotification(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index === -1) return false
    
    this.notifications.splice(index, 1)
    return true
  }
}

// Instância singleton do serviço
export const automationService = new AutomationService()

// Exportar tipos para uso em outros componentes
export type { AutomationRule, Notification, AutomationContext, Task }