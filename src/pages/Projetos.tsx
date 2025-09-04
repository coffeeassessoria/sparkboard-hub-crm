import React, { useState, useCallback, useMemo, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Plus, Calendar, User, Tag, Settings, Clock, Kanban, List, BarChart3, Search, Filter, AlertTriangle, Zap, FileText, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskModal } from "@/components/project/task-modal"
import TaskFormModal from "@/components/project/task-form-modal"
import { ColumnManagerModal } from "@/components/project/column-manager-modal"
import { AutomationManager } from "@/components/project/automation-manager"
import { NotificationCenter } from "@/components/project/notification-center"
import TemplateManager from "@/components/project/template-manager"
import TimeTracker from "@/components/project/time-tracker"
import { ClientManager } from "@/components/ClientManager"
import { ClientSelector } from "@/components/ClientSelector"

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
  projectType: "client" | "internal"
}

interface SubTask {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
  uploadedBy: string
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  edited?: boolean
  editedAt?: string
}

interface TimeEntry {
  id: string
  description: string
  hours: number
  date: string
  user: string
  type: "manual" | "tracked"
}

interface Project {
  id: string
  name: string
  clientId?: string
  clientName?: string
  type: "client" | "internal"
  description: string
  status: "active" | "completed" | "paused" | "cancelled"
  createdAt: string
  team: string[]
  columns: Column[]
}

interface Column {
  id: string
  title: string
  tasks: Task[]
}

const initialData = {
  projects: [
    {
      id: "proj-1",
      name: "Cliente ABC - Campanha Digital",
      clientId: "client-1",
      clientName: "ABC Empresa",
      type: "client" as const,
      description: "Campanha completa de marketing digital incluindo redesign do site e estratégia de SEO",
      status: "active" as const,
      createdAt: "2024-01-01T00:00:00Z",
      team: ["Ana Silva", "Carlos Santos", "Maria Oliveira"],
      columns: [
        {
          id: "todo",
          title: "A Fazer",
          tasks: [
            {
              id: "1",
              title: "Criar wireframes da landing page",
              description: "Desenvolver wireframes detalhados para a nova landing page do cliente, incluindo versões desktop e mobile.",
              responsible: ["Ana Silva"],
              dueDate: "2024-01-15",
              dueTime: "14:00",
              tags: ["Design", "UX/UI", "Wireframe"],
              status: "todo",
              priority: "high" as const,
              subtasks: [
                { id: "sub-1", title: "Pesquisar referências de design", completed: true, createdAt: "2024-01-10T00:00:00Z" },
                { id: "sub-2", title: "Criar wireframe desktop", completed: false, createdAt: "2024-01-10T00:00:00Z" },
                { id: "sub-3", title: "Criar wireframe mobile", completed: false, createdAt: "2024-01-10T00:00:00Z" }
              ],
              attachments: [],
              comments: [
                { id: "comm-1", content: "Lembrar de incluir seção de depoimentos", author: "Ana Silva", createdAt: "2024-01-10T10:00:00Z" }
              ],
              timeTracking: [
                { id: "time-1", description: "Pesquisa inicial", hours: 2, date: "2024-01-10", user: "Ana Silva", type: "manual" }
              ],
              createdAt: "2024-01-10T00:00:00Z",
              updatedAt: "2024-01-10T10:00:00Z",
              createdBy: "Ana Silva",
              estimatedHours: 8,
              actualHours: 2,
              clientId: "client-1",
              projectType: "client"
            },
            {
              id: "2",
              title: "Pesquisa de palavras-chave",
              description: "Realizar pesquisa completa de palavras-chave para a campanha de SEO do cliente.",
              responsible: ["Carlos Santos"],
              dueDate: "2024-01-16",
              dueTime: "10:00",
              tags: ["SEO", "Pesquisa", "Marketing"],
              status: "todo",
              priority: "medium" as const,
              subtasks: [],
              attachments: [],
              comments: [],
              timeTracking: [],
              createdAt: "2024-01-10T00:00:00Z",
              updatedAt: "2024-01-10T00:00:00Z",
              createdBy: "Carlos Santos",
              estimatedHours: 4,
              clientId: "client-1",
              projectType: "client"
            }
          ]
        },
        {
          id: "inprogress",
          title: "Em Progresso",
          tasks: [
            {
              id: "3",
              title: "Desenvolvimento do protótipo",
              description: "Criar protótipo interativo baseado nos wireframes aprovados.",
              responsible: ["Ana Silva", "Maria Oliveira"],
              dueDate: "2024-01-18",
              dueTime: "16:30",
              tags: ["Design", "Protótipo", "Figma"],
              status: "inprogress",
              priority: "high" as const,
              subtasks: [
                { id: "sub-4", title: "Configurar componentes no Figma", completed: true, createdAt: "2024-01-12T00:00:00Z" },
                { id: "sub-5", title: "Criar interações", completed: false, createdAt: "2024-01-12T00:00:00Z" }
              ],
              attachments: [],
              comments: [],
              timeTracking: [
                { id: "time-2", description: "Setup do projeto no Figma", hours: 3, date: "2024-01-12", user: "Ana Silva", type: "tracked" }
              ],
              createdAt: "2024-01-12T00:00:00Z",
              updatedAt: "2024-01-12T15:00:00Z",
              createdBy: "Ana Silva",
              estimatedHours: 12,
              actualHours: 3,
              clientId: "client-1",
              projectType: "client"
            }
          ]
        },
        {
          id: "review",
          title: "Em Revisão",
          tasks: [
            {
              id: "4",
              title: "Análise de concorrência",
              description: "Executar análise detalhada dos principais concorrentes do cliente.",
              responsible: ["Carlos Santos"],
              dueDate: "2024-01-12",
              dueTime: "11:00",
              tags: ["Pesquisa", "Análise", "Concorrência"],
              status: "review",
              priority: "medium" as const,
              subtasks: [],
              attachments: [
                { id: "att-1", name: "analise-concorrencia.pdf", url: "/files/analise-concorrencia.pdf", type: "pdf", size: 2048000, uploadedAt: "2024-01-11T14:00:00Z", uploadedBy: "Carlos Santos" }
              ],
              comments: [
                { id: "comm-2", content: "Análise completa, aguardando revisão do cliente", author: "Carlos Santos", createdAt: "2024-01-11T16:00:00Z" }
              ],
              timeTracking: [
                { id: "time-3", description: "Pesquisa e análise", hours: 6, date: "2024-01-11", user: "Carlos Santos", type: "manual" }
              ],
              createdAt: "2024-01-08T00:00:00Z",
              updatedAt: "2024-01-11T16:00:00Z",
              createdBy: "Carlos Santos",
              estimatedHours: 8,
              actualHours: 6,
              clientId: "client-1",
              projectType: "client"
            }
          ]
        },
        {
          id: "done",
          title: "Concluído",
          tasks: [
            {
              id: "5",
              title: "Briefing inicial com cliente",
              description: "Reunião de alinhamento e coleta de requisitos do projeto.",
              responsible: ["Maria Oliveira"],
              dueDate: "2024-01-05",
              dueTime: "10:00",
              tags: ["Briefing", "Cliente", "Requisitos"],
              status: "done",
              priority: "high" as const,
              subtasks: [
                { id: "sub-6", title: "Preparar questionário", completed: true, createdAt: "2024-01-03T00:00:00Z" },
                { id: "sub-7", title: "Conduzir reunião", completed: true, createdAt: "2024-01-03T00:00:00Z" },
                { id: "sub-8", title: "Documentar requisitos", completed: true, createdAt: "2024-01-03T00:00:00Z" }
              ],
              attachments: [
                { id: "att-2", name: "briefing-cliente-abc.docx", url: "/files/briefing-cliente-abc.docx", type: "docx", size: 1024000, uploadedAt: "2024-01-05T15:00:00Z", uploadedBy: "Maria Oliveira" }
              ],
              comments: [],
              timeTracking: [
                { id: "time-4", description: "Reunião com cliente", hours: 2, date: "2024-01-05", user: "Maria Oliveira", type: "manual" },
                { id: "time-5", description: "Documentação", hours: 1, date: "2024-01-05", user: "Maria Oliveira", type: "manual" }
              ],
              createdAt: "2024-01-03T00:00:00Z",
              updatedAt: "2024-01-05T15:00:00Z",
              createdBy: "Maria Oliveira",
              estimatedHours: 3,
              actualHours: 3,
              clientId: "client-1",
              projectType: "client"
            }
          ]
        }
      ]
    }
  ],
  currentProject: "proj-1"
}

const currentProjectData = initialData.projects[0].columns

export default function Projetos() {
  // Carregar dados do localStorage ou usar dados iniciais
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('sparkboard-projects')
    return savedProjects ? JSON.parse(savedProjects) : initialData.projects
  })
  
  const [currentProjectId, setCurrentProjectId] = useState(() => {
    const savedCurrentProject = localStorage.getItem('sparkboard-current-project')
    return savedCurrentProject || initialData.currentProject
  })
  
  const [columns, setColumns] = useState<Column[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isTaskFormModalOpen, setIsTaskFormModalOpen] = useState(false)
  const [isTestModalOpen, setIsTestModalOpen] = useState(false)
  const [isColumnManagerOpen, setIsColumnManagerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [filterResponsible, setFilterResponsible] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'created'>('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'kanban' | 'my-tasks' | 'calendar' | 'timeline'>('kanban')
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedClientName, setSelectedClientName] = useState<string>('')
  const [filterClientName, setFilterClientName] = useState<string>('all')
  const [filterDeliveryDate, setFilterDeliveryDate] = useState<string>('')
  const [filterTaskName, setFilterTaskName] = useState<string>('')
  const [filterBy, setFilterBy] = useState<{
    responsible?: string
    priority?: string
    tags?: string[]
    status?: string
  }>({})

  // Função para obter dados do projeto atual
  const getCurrentProject = () => {
    return projects.find(p => p.id === currentProjectId) || projects[0]
  }

  const currentProject = getCurrentProject()
  
  // useEffect para salvar projetos no localStorage
  useEffect(() => {
    localStorage.setItem('sparkboard-projects', JSON.stringify(projects))
  }, [projects])

  // useEffect para salvar projeto atual no localStorage
  useEffect(() => {
    localStorage.setItem('sparkboard-current-project', currentProjectId)
  }, [currentProjectId])

  // Atualizar colunas quando o projeto atual mudar
  useEffect(() => {
    setColumns(currentProject?.columns || [])
  }, [currentProjectId, projects, currentProject])

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const newProjects = [...projects]
    const projectIndex = newProjects.findIndex(p => p.id === currentProjectId)
    if (projectIndex === -1) return

    const sourceColumn = newProjects[projectIndex].columns.find(col => col.id === source.droppableId)
    const destColumn = newProjects[projectIndex].columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const task = sourceColumn.tasks.find(task => task.id === draggableId)
    if (!task) return

    const updatedTask = { ...task, status: destination.droppableId, updatedAt: new Date().toISOString() }

    newProjects[projectIndex].columns = newProjects[projectIndex].columns.map(column => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== draggableId)
        }
      }
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(destination.index, 0, updatedTask)
        return {
          ...column,
          tasks: newTasks
        }
      }
      return column
    })

    setProjects(newProjects)
    setColumns(newProjects[projectIndex].columns)
  }, [projects, currentProjectId])

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task)
    console.log('Setting selectedTask and opening modal')
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(false)
    setIsTaskFormModalOpen(true)
  }

  const handleTaskDelete = (taskId: string) => {
    const newProjects = [...projects]
    const projectIndex = newProjects.findIndex(p => p.id === currentProjectId)
    if (projectIndex === -1) return

    newProjects[projectIndex].columns = newProjects[projectIndex].columns.map(column => ({
      ...column,
      tasks: column.tasks.filter(task => task.id !== taskId)
    }))

    setProjects(newProjects)
    setColumns(newProjects[projectIndex].columns)
    setIsTaskModalOpen(false)
  }

  const handleTaskSave = useCallback((taskData: Partial<Task>) => {
    const newProjects = [...projects]
    const projectIndex = newProjects.findIndex(p => p.id === currentProjectId)
    if (projectIndex === -1) return

    if (editingTask) {
      // Update existing task
      newProjects[projectIndex].columns = newProjects[projectIndex].columns.map(column => ({
        ...column,
        tasks: column.tasks.map(task => 
          task.id === editingTask.id 
            ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
            : task
        )
      }))
    } else {
      // Create new task
      const newTask: Task = {
        id: Date.now().toString(),
        title: taskData.title || "",
        description: taskData.description || "",
        responsible: taskData.responsible || [],
        dueDate: taskData.dueDate || "",
        dueTime: taskData.dueTime || "",
        tags: taskData.tags || [],
        status: "todo",
        priority: taskData.priority || "medium",
        subtasks: [],
        attachments: [],
        comments: [],
        timeTracking: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "Current User",
        clientId: currentProject.clientId,
        projectType: currentProject.type
      }

      newProjects[projectIndex].columns = newProjects[projectIndex].columns.map(column => 
        column.id === "todo" 
          ? { ...column, tasks: [newTask, ...column.tasks] }
          : column
      )
    }

    setProjects(newProjects)
    setColumns(newProjects[projectIndex].columns)
    setIsTaskFormModalOpen(false)
    setEditingTask(null)
  }, [projects, currentProjectId, editingTask, currentProject])

  const handleColumnsSave = useCallback((newColumns: Column[]) => {
    const newProjects = [...projects]
    const projectIndex = newProjects.findIndex(p => p.id === currentProjectId)
    if (projectIndex === -1) return

    newProjects[projectIndex].columns = newColumns
    setProjects(newProjects)
    setColumns(newColumns)
  }, [projects, currentProjectId])

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground"
      case "medium": return "bg-warning text-warning-foreground"
      case "low": return "bg-success text-success-foreground"
      default: return "bg-secondary text-secondary-foreground"
    }
  }, [])

  // Função para filtrar e ordenar tarefas
  const filterAndSortTasks = useCallback((tasks: Task[]) => {
    const filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      
      const matchesResponsible = filterResponsible === 'all' || 
                                (Array.isArray(task.responsible) 
                                  ? task.responsible.includes(filterResponsible)
                                  : task.responsible === filterResponsible)
      
      // Filtro por nome do cliente
      const matchesClientName = filterClientName === 'all' || 
                                (task.clientId && selectedClientName && 
                                 selectedClientName.toLowerCase().includes(filterClientName.toLowerCase()))
      
      // Filtro por nome da tarefa (mais específico que a busca geral)
      const matchesTaskName = !filterTaskName || 
                             task.title.toLowerCase().includes(filterTaskName.toLowerCase())
      
      // Filtro por data de entrega
      const matchesDeliveryDate = !filterDeliveryDate || 
                                 task.dueDate.startsWith(filterDeliveryDate)
      
      return matchesSearch && matchesPriority && matchesResponsible && 
             matchesClientName && matchesTaskName && matchesDeliveryDate
    })

    // Ordenação
    return filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - 
                      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'created':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [searchTerm, filterPriority, filterResponsible, filterClientName, filterTaskName, filterDeliveryDate, selectedClientName, sortBy, sortOrder])

  // Obter lista única de responsáveis
  const getAllResponsibles = useMemo(() => {
    const responsibles = new Set<string>()
    columns.forEach(column => {
      column.tasks.forEach(task => {
        if (Array.isArray(task.responsible)) {
          task.responsible.forEach(r => responsibles.add(r))
        } else {
          responsibles.add(task.responsible)
        }
      })
    })
    return Array.from(responsibles)
  }, [columns])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
            <p className="text-muted-foreground">Gerencie suas tarefas e projetos em um quadro Kanban</p>
          </div>
          <Select value={currentProjectId} onValueChange={setCurrentProjectId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecionar projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

        </div>
        <div className="flex gap-2">
          <NotificationCenter projectId={currentProjectId} />
          <Button 
            onClick={() => setIsColumnManagerOpen(true)}
            variant="outline"
            className="hover-lift"
          >
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Colunas
          </Button>
          <Button 
            onClick={() => setIsTaskFormModalOpen(true)}
            className="bg-gradient-sunset text-white hover:opacity-90 transition-all duration-200 hover-lift"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Tarefa
          </Button>
          
          {/* Botão de teste temporário */}
          <Button
            onClick={() => setIsTestModalOpen(true)}
            variant="outline"
          >
            Teste Modal
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="my-tasks" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Minhas Tarefas
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="automations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Controle de Tempo
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          {/* Barra de Busca e Filtros */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {(filterPriority !== 'all' || filterResponsible !== 'all' || filterClientName !== 'all' || filterTaskName || filterDeliveryDate || searchTerm || sortBy !== 'dueDate' || sortOrder !== 'asc') && (
                   <Badge variant="secondary" className="ml-1">!</Badge>
                 )}
              </Button>
            </div>
            
            {showFilters && (
              <div className="flex flex-col gap-4 p-4 bg-card rounded-lg border">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Prioridade</Label>
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Responsável</Label>
                    <Select value={filterResponsible} onValueChange={setFilterResponsible}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {getAllResponsibles().map(responsible => (
                          <SelectItem key={responsible} value={responsible}>
                            {responsible}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Nome da Tarefa</Label>
                    <Input
                      placeholder="Filtrar por nome..."
                      value={filterTaskName}
                      onChange={(e) => setFilterTaskName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Data de Entrega</Label>
                    <Input
                      type="date"
                      value={filterDeliveryDate}
                      onChange={(e) => setFilterDeliveryDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Cliente</Label>
                    <Input
                      placeholder="Filtrar por cliente..."
                      value={filterClientName === 'all' ? '' : filterClientName}
                      onChange={(e) => setFilterClientName(e.target.value || 'all')}
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">Ordenar por</Label>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Data de Vencimento</SelectItem>
                        <SelectItem value="priority">Prioridade</SelectItem>
                        <SelectItem value="title">Título</SelectItem>
                        <SelectItem value="created">Data de Criação</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                       setFilterPriority('all')
                       setFilterResponsible('all')
                       setFilterClientName('all')
                       setFilterTaskName('')
                       setFilterDeliveryDate('')
                       setSearchTerm('')
                       setSortBy('dueDate')
                       setSortOrder('asc')
                     }}
                    className="text-sm"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas do Projeto */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium">Total de Tarefas</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {columns.reduce((acc, col) => acc + col.tasks.length, 0)}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Concluídas</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {columns.find(col => col.id === 'done')?.tasks.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Em Progresso</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {columns.find(col => col.id === 'in-progress')?.tasks.length || 0}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">Atrasadas</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {columns.flatMap(col => col.tasks)
                  .filter(task => new Date(task.dueDate) < new Date() && task.status !== 'done').length}
              </p>
            </Card>
          </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    column.id === 'todo' ? 'bg-gray-500' :
                    column.id === 'in-progress' ? 'bg-primary' :
              column.id === 'review' ? 'bg-warning' :
              column.id === 'done' ? 'bg-success' : 'bg-secondary'
                  }`}></div>
                  <h2 className="font-semibold text-foreground">{column.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {/* Indicadores de prioridade */}
                  {(() => {
                    const filteredTasks = filterAndSortTasks(column.tasks)
                    const urgentCount = filteredTasks.filter(t => t.priority === 'urgent').length
                    const overdueCount = filteredTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length
                    
                    return (
                      <div className="flex items-center gap-1">
                        {urgentCount > 0 && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            🚨 {urgentCount}
                          </Badge>
                        )}
                        {overdueCount > 0 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 border-red-500 text-red-600">
                            ⚠️ {overdueCount}
                          </Badge>
                        )}
                      </div>
                    )
                  })()}
                  <Badge variant="secondary" className="text-xs font-medium">
                    {filterAndSortTasks(column.tasks).length}
                  </Badge>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver 
                        ? "border-primary bg-primary/5" 
                        : "border-border bg-card/50"
                    }`}
                  >
                    <div className="space-y-3">
                      {filterAndSortTasks(column.tasks).map((task, index) => {
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done'
                        const dueSoon = new Date(task.dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && !isOverdue
                        
                        return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`cursor-pointer transition-all duration-200 hover-lift relative ${
                                snapshot.isDragging ? "shadow-glow rotate-1" : "shadow-sm"
                              } ${
                                isOverdue ? "border-l-4 border-l-red-500" :
                                dueSoon ? "border-l-4 border-l-yellow-500" : ""
                              }`}
                              onClick={() => handleTaskClick(task)}
                            >
                              {/* Indicador de prioridade */}
                              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                                task.priority === 'urgent' ? 'bg-red-500' :
                                task.priority === 'high' ? 'bg-orange-500' :
                                task.priority === 'medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}></div>
                              
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-foreground line-clamp-2 pr-4">
                                  {task.title}
                                </CardTitle>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {/* Responsáveis */}
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <User className="w-3 h-3 mr-1" />
                                  <span className="truncate">
                                    {Array.isArray(task.responsible) 
                                      ? task.responsible.slice(0, 2).join(', ') + (task.responsible.length > 2 ? '...' : '')
                                      : task.responsible
                                    }
                                  </span>
                                </div>
                                
                                {/* Data de vencimento */}
                                <div className={`flex items-center text-xs ${
                                  isOverdue ? 'text-red-600' :
                                  dueSoon ? 'text-yellow-600' :
                                  'text-muted-foreground'
                                }`}>
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                  {task.dueTime && ` - ${task.dueTime}`}
                                  {isOverdue && <span className="ml-1 font-medium">⚠️</span>}
                                  {dueSoon && <span className="ml-1">⏰</span>}
                                </div>

                                {/* Progresso de subtarefas */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className="bg-primary h-1.5 rounded-full transition-all"
                                        style={{
                                          width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%`
                                        }}
                                      ></div>
                                    </div>
                                    <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                  </div>
                                )}

                                {/* Tags e prioridade */}
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.slice(0, 2).map((tag, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{task.tags.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Indicadores adicionais */}
                                  <div className="flex items-center gap-1">
                                    {task.attachments && task.attachments.length > 0 && (
                                      <span className="text-xs text-muted-foreground">📎</span>
                                    )}
                                    {task.comments && task.comments.length > 0 && (
                                      <span className="text-xs text-muted-foreground">💬</span>
                                    )}
                                    {task.estimatedHours && task.estimatedHours > 0 && (
                                      <span className="text-xs text-muted-foreground">
                                        <Clock className="w-3 h-3 inline mr-0.5" />
                                        {task.estimatedHours}h
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                        )
                      })}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
        </TabsContent>

        <TabsContent value="my-tasks">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Minhas Tarefas</h2>
            <div className="grid gap-4">
              {columns.flatMap(column => column.tasks)
                .filter(task => task.responsible.includes('Current User'))
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(task => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedTask(task)
                          setIsTaskModalOpen(true)
                        }}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline">{task.status}</Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              }
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-tasks">
          <div className="space-y-6">
            {/* Header com estatísticas das minhas tarefas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Minhas Tarefas</p>
                      <p className="text-2xl font-bold">
                        {currentProject ? 
                          currentProject.columns.flatMap(col => col.tasks)
                            .filter(task => task.responsible.includes('Você')).length : 0
                        }
                      </p>
                    </div>
                    <User className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {currentProject ? 
                          currentProject.columns.flatMap(col => 
                            col.tasks.filter(task => task.responsible.includes('Você') && col.id !== 'done')
                          ).length : 0
                        }
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {currentProject ? 
                          currentProject.columns.find(col => col.id === 'done')?.tasks
                            .filter(task => task.responsible.includes('Você')).length || 0 : 0
                        }
                      </p>
                    </div>
                    <Badge className="h-8 w-8 bg-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                      <p className="text-2xl font-bold text-red-600">
                        {currentProject ? 
                          currentProject.columns.flatMap(col => 
                            col.tasks.filter(task => {
                              if (!task.responsible.includes('Você') || col.id === 'done') return false;
                              const today = new Date();
                              const dueDate = new Date(task.dueDate);
                              return dueDate < today;
                            })
                          ).length : 0
                        }
                      </p>
                    </div>
                    <Tag className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros específicos para minhas tarefas */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar nas minhas tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as prioridades</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Data de vencimento</SelectItem>
                  <SelectItem value="priority">Prioridade</SelectItem>
                  <SelectItem value="title">Título</SelectItem>
                  <SelectItem value="createdAt">Data de criação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de minhas tarefas */}
            <div className="space-y-4">
              {currentProject ? (
                (() => {
                  const myTasks = currentProject.columns.flatMap(col => 
                    col.tasks
                      .filter(task => task.responsible.includes('Você'))
                      .map(task => ({ ...task, columnName: col.name, columnId: col.id }))
                  );
                  
                  const filteredTasks = filterAndSortTasks(myTasks);
                  
                  if (filteredTasks.length === 0) {
                    return (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            Nenhuma tarefa encontrada
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm || filterPriority !== 'all' ? 
                              'Tente ajustar os filtros de busca.' : 
                              'Você não possui tarefas atribuídas neste projeto.'
                            }
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  return filteredTasks.map((task) => {
                    const today = new Date();
                    const dueDate = new Date(task.dueDate);
                    const isOverdue = dueDate < today && task.columnId !== 'done';
                    const isDueSoon = !isOverdue && dueDate <= new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000) && task.columnId !== 'done';
                    
                    return (
                      <Card key={task.id} className={`cursor-pointer transition-all hover:shadow-md ${
                        isOverdue ? 'border-red-200 bg-red-50' : 
                        isDueSoon ? 'border-orange-200 bg-orange-50' : ''
                      }`} onClick={() => setSelectedTask(task)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium text-sm">{task.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.priority === 'urgent' ? 'border-red-500 text-red-700 bg-red-50' :
                                    task.priority === 'high' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                                    task.priority === 'medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                    'border-green-500 text-green-700 bg-green-50'
                                  }`}
                                >
                                  {task.priority === 'urgent' ? 'Urgente' :
                                   task.priority === 'high' ? 'Alta' :
                                   task.priority === 'medium' ? 'Média' : 'Baixa'}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {task.columnName}
                                </Badge>
                              </div>
                              
                              {task.description && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-orange-600 font-medium' : ''}>
                                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                    {isOverdue && ' ⚠️'}
                                    {isDueSoon && ' ⏰'}
                                  </span>
                                </div>
                                
                                {task.tags.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    <span>{task.tags.slice(0, 2).join(', ')}</span>
                                    {task.tags.length > 2 && <span>+{task.tags.length - 2}</span>}
                                  </div>
                                )}
                                
                                {task.estimatedHours && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{task.estimatedHours}h</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Progresso de subtarefas */}
                              {task.subtasks.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <span>Subtarefas: {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-primary h-1.5 rounded-full transition-all" 
                                      style={{ 
                                        width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  });
                })()
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      Selecione um projeto
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha um projeto para visualizar suas tarefas.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="space-y-6">
            {/* Header do Calendário */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Calendário de Tarefas</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Hoje
                </Button>
                <Button variant="outline" size="sm">
                  ← Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Próximo →
                </Button>
              </div>
            </div>

            {currentProject ? (
              <div className="space-y-4">
                {/* Resumo do mês */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Este Mês</p>
                          <p className="text-2xl font-bold">
                            {currentProject.columns.flatMap(col => col.tasks)
                              .filter(task => {
                                const taskDate = new Date(task.dueDate);
                                const now = new Date();
                                return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
                              }).length
                            }
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Vencendo Hoje</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {currentProject.columns.flatMap(col => 
                              col.tasks.filter(task => {
                                const taskDate = new Date(task.dueDate);
                                const today = new Date();
                                return taskDate.toDateString() === today.toDateString() && col.id !== 'done';
                              })
                            ).length
                            }
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                          <p className="text-2xl font-bold text-red-600">
                            {currentProject.columns.flatMap(col => 
                              col.tasks.filter(task => {
                                const taskDate = new Date(task.dueDate);
                                const today = new Date();
                                return taskDate < today && col.id !== 'done';
                              })
                            ).length
                            }
                          </p>
                        </div>
                        <Tag className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Vista de agenda por data */}
                <div className="space-y-4">
                  {(() => {
                    const allTasks = currentProject.columns.flatMap(col => 
                      col.tasks.map(task => ({ ...task, columnName: col.name, columnId: col.id }))
                    );
                    
                    // Agrupar tarefas por data
                    const tasksByDate = allTasks.reduce((acc, task) => {
                      const dateKey = new Date(task.dueDate).toDateString();
                      if (!acc[dateKey]) {
                        acc[dateKey] = [];
                      }
                      acc[dateKey].push(task);
                      return acc;
                    }, {});
                    
                    // Ordenar datas
                    const sortedDates = Object.keys(tasksByDate).sort((a, b) => 
                      new Date(a).getTime() - new Date(b).getTime()
                    );
                    
                    // Mostrar próximos 14 dias
                    const today = new Date();
                    const next14Days = [];
                    for (let i = 0; i < 14; i++) {
                      const date = new Date(today);
                      date.setDate(today.getDate() + i);
                      next14Days.push(date.toDateString());
                    }
                    
                    return next14Days.map(dateKey => {
                      const date = new Date(dateKey);
                      const tasksForDate = tasksByDate[dateKey] || [];
                      const isToday = dateKey === today.toDateString();
                      const isPast = date < today;
                      
                      return (
                        <Card key={dateKey} className={isToday ? 'border-blue-500 bg-blue-50' : ''}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className={`font-medium ${isToday ? 'text-blue-700' : ''}`}>
                                  {date.toLocaleDateString('pt-BR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long' 
                                  })}
                                  {isToday && ' (Hoje)'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {tasksForDate.length} {tasksForDate.length === 1 ? 'tarefa' : 'tarefas'}
                                </p>
                              </div>
                              {tasksForDate.length > 0 && (
                                <Badge variant={isPast ? 'destructive' : isToday ? 'default' : 'secondary'}>
                                  {tasksForDate.filter(t => t.columnId !== 'done').length} pendentes
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          
                          {tasksForDate.length > 0 && (
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                {tasksForDate.map(task => {
                                  const isOverdue = isPast && task.columnId !== 'done';
                                  
                                  return (
                                    <div 
                                      key={task.id}
                                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                                        isOverdue ? 'border-red-200 bg-red-50' : 
                                        task.columnId === 'done' ? 'border-green-200 bg-green-50' :
                                        'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                      onClick={() => setSelectedTask(task)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium text-sm">{task.title}</h4>
                                            <Badge 
                                              variant="outline" 
                                              className={`text-xs ${
                                                task.priority === 'urgent' ? 'border-red-500 text-red-700' :
                                                task.priority === 'high' ? 'border-orange-500 text-orange-700' :
                                                task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                                'border-green-500 text-green-700'
                                              }`}
                                            >
                                              {task.priority === 'urgent' ? 'Urgente' :
                                               task.priority === 'high' ? 'Alta' :
                                               task.priority === 'medium' ? 'Média' : 'Baixa'}
                                            </Badge>
                                            <Badge variant="secondary" className="text-xs">
                                              {task.columnName}
                                            </Badge>
                                          </div>
                                          
                                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <User className="w-3 h-3" />
                                              <span>{task.responsible.slice(0, 2).join(', ')}</span>
                                              {task.responsible.length > 2 && <span>+{task.responsible.length - 2}</span>}
                                            </div>
                                            
                                            {task.dueTime && (
                                              <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{task.dueTime}</span>
                                              </div>
                                            )}
                                            
                                            {task.estimatedHours && (
                                              <div className="flex items-center gap-1">
                                                <span>{task.estimatedHours}h estimadas</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {isOverdue && (
                                          <Badge variant="destructive" className="text-xs">
                                            Atrasada
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    });
                  })()
                  }
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Selecione um projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um projeto para visualizar o calendário de tarefas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-6">
            {/* Header do Timeline */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Timeline do Projeto</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Semana
                </Button>
                <Button variant="outline" size="sm">
                  Mês
                </Button>
                <Button variant="outline" size="sm">
                  Trimestre
                </Button>
              </div>
            </div>

            {currentProject ? (
              <div className="space-y-6">
                {/* Estatísticas do Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duração Total</p>
                          <p className="text-2xl font-bold">
                            {(() => {
                              const allTasks = currentProject.columns.flatMap(col => col.tasks);
                              if (allTasks.length === 0) return '0 dias';
                              
                              const dates = allTasks.map(task => new Date(task.dueDate));
                              const minDate = new Date(Math.min(...dates));
                              const maxDate = new Date(Math.max(...dates));
                              const diffTime = Math.abs(maxDate - minDate);
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              
                              return `${diffDays} dias`;
                            })()
                            }
                          </p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Progresso Geral</p>
                          <p className="text-2xl font-bold text-green-600">
                            {(() => {
                              const allTasks = currentProject.columns.flatMap(col => col.tasks);
                              const completedTasks = currentProject.columns.find(col => col.id === 'done')?.tasks.length || 0;
                              const progress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
                              return `${progress}%`;
                            })()
                            }
                          </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tarefas Críticas</p>
                          <p className="text-2xl font-bold text-red-600">
                            {currentProject.columns.flatMap(col => 
                              col.tasks.filter(task => task.priority === 'urgent' && col.id !== 'done')
                            ).length
                            }
                          </p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Horas Estimadas</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {currentProject.columns.flatMap(col => col.tasks)
                              .reduce((total, task) => total + (task.estimatedHours || 0), 0)
                            }h
                          </p>
                        </div>
                        <Clock className="h-8 w-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timeline Visual */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cronograma de Tarefas</CardTitle>
                    <CardDescription>
                      Visualização temporal das tarefas do projeto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const allTasks = currentProject.columns.flatMap(col => 
                          col.tasks.map(task => ({ ...task, columnName: col.name, columnId: col.id }))
                        );
                        
                        // Ordenar tarefas por data de vencimento
                        const sortedTasks = allTasks.sort((a, b) => 
                          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                        );
                        
                        // Calcular range de datas para o timeline
                        if (sortedTasks.length === 0) {
                          return (
                            <div className="text-center py-8 text-muted-foreground">
                              Nenhuma tarefa encontrada para exibir no timeline.
                            </div>
                          );
                        }
                        
                        const minDate = new Date(sortedTasks[0].dueDate);
                        const maxDate = new Date(sortedTasks[sortedTasks.length - 1].dueDate);
                        const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)));
                        
                        return (
                          <div className="space-y-3">
                            {/* Header do timeline com datas */}
                            <div className="flex items-center mb-4">
                              <div className="w-64 text-sm font-medium text-muted-foreground">
                                Tarefa
                              </div>
                              <div className="flex-1 flex justify-between text-xs text-muted-foreground px-2">
                                <span>{minDate.toLocaleDateString('pt-BR')}</span>
                                <span>{maxDate.toLocaleDateString('pt-BR')}</span>
                              </div>
                            </div>
                            
                            {/* Linhas do timeline */}
                            {sortedTasks.map(task => {
                              const taskDate = new Date(task.dueDate);
                              const daysFromStart = Math.max(0, Math.ceil((taskDate - minDate) / (1000 * 60 * 60 * 24)));
                              const position = totalDays > 0 ? (daysFromStart / totalDays) * 100 : 0;
                              const isOverdue = taskDate < new Date() && task.columnId !== 'done';
                              const isCompleted = task.columnId === 'done';
                              
                              return (
                                <div key={task.id} className="flex items-center group hover:bg-gray-50 p-2 rounded-lg">
                                  {/* Info da tarefa */}
                                  <div className="w-64 pr-4">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${
                                          task.priority === 'urgent' ? 'border-red-500 text-red-700' :
                                          task.priority === 'high' ? 'border-orange-500 text-orange-700' :
                                          task.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                          'border-green-500 text-green-700'
                                        }`}
                                      >
                                        {task.priority === 'urgent' ? 'U' :
                                         task.priority === 'high' ? 'A' :
                                         task.priority === 'medium' ? 'M' : 'B'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="secondary" className="text-xs">
                                        {task.columnName}
                                      </Badge>
                                      {task.estimatedHours && (
                                        <span className="text-xs text-muted-foreground">
                                          {task.estimatedHours}h
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Barra do timeline */}
                                  <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                                    {/* Linha de posição */}
                                    <div 
                                      className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                        isCompleted ? 'bg-green-500' :
                                        isOverdue ? 'bg-red-500' :
                                        'bg-blue-500'
                                      }`}
                                      style={{ left: `${Math.min(95, Math.max(1, position))}%` }}
                                    />
                                    
                                    {/* Barra de progresso estimada */}
                                    <div 
                                      className={`absolute top-1/2 transform -translate-y-1/2 h-2 rounded-full ${
                                        isCompleted ? 'bg-green-200' :
                                        isOverdue ? 'bg-red-200' :
                                        'bg-blue-200'
                                      }`}
                                      style={{ 
                                        left: `${Math.max(0, position - 2)}%`,
                                        width: `${Math.min(10, task.estimatedHours || 3)}%`
                                      }}
                                    />
                                  </div>
                                  
                                  {/* Data e status */}
                                  <div className="w-32 pl-4 text-right">
                                    <div className="text-sm font-medium">
                                      {taskDate.toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                      {isOverdue && (
                                        <Badge variant="destructive" className="text-xs">
                                          Atrasada
                                        </Badge>
                                      )}
                                      {isCompleted && (
                                        <Badge variant="default" className="text-xs bg-green-600">
                                          Concluída
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()
                      }
                    </div>
                  </CardContent>
                </Card>

                {/* Análise de Dependências */}
                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Cronograma</CardTitle>
                    <CardDescription>
                      Insights sobre o andamento do projeto
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Distribuição por Status */}
                      <div>
                        <h4 className="font-medium mb-3">Distribuição por Status</h4>
                        <div className="space-y-2">
                          {currentProject.columns.map(column => {
                            const taskCount = column.tasks.length;
                            const totalTasks = currentProject.columns.reduce((sum, col) => sum + col.tasks.length, 0);
                            const percentage = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;
                            
                            return (
                              <div key={column.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: column.color }}
                                  />
                                  <span className="text-sm">{column.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="h-2 rounded-full"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: column.color
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-12 text-right">
                                    {taskCount}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Distribuição por Prioridade */}
                      <div>
                        <h4 className="font-medium mb-3">Distribuição por Prioridade</h4>
                        <div className="space-y-2">
                          {[
                            { key: 'urgent', label: 'Urgente', color: 'bg-red-500' },
                            { key: 'high', label: 'Alta', color: 'bg-orange-500' },
                            { key: 'medium', label: 'Média', color: 'bg-yellow-500' },
                            { key: 'low', label: 'Baixa', color: 'bg-green-500' }
                          ].map(priority => {
                            const taskCount = currentProject.columns.flatMap(col => col.tasks)
                              .filter(task => task.priority === priority.key).length;
                            const totalTasks = currentProject.columns.reduce((sum, col) => sum + col.tasks.length, 0);
                            const percentage = totalTasks > 0 ? Math.round((taskCount / totalTasks) * 100) : 0;
                            
                            return (
                              <div key={priority.key} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                                  <span className="text-sm">{priority.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${priority.color}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium w-12 text-right">
                                    {taskCount}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Selecione um projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um projeto para visualizar o timeline e análises.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="automations">
          <div className="space-y-6">
            {currentProjectId ? (
              <AutomationManager projectId={currentProjectId} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Selecione um projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um projeto para configurar automações.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            {currentProjectId ? (
              <TemplateManager projectId={currentProjectId} />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Selecione um projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Escolha um projeto para gerenciar templates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
         </TabsContent>

         <TabsContent value="time">
           <div className="space-y-6">
             {currentProjectId ? (
               <TimeTracker projectId={currentProjectId} />
             ) : (
               <Card>
                 <CardContent className="p-8 text-center">
                   <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                   <h3 className="text-lg font-medium text-muted-foreground mb-2">
                     Selecione um projeto
                   </h3>
                   <p className="text-sm text-muted-foreground">
                     Escolha um projeto para controlar o tempo.
                   </p>
                 </CardContent>
               </Card>
             )}
           </div>
         </TabsContent>

         <TabsContent value="clients">
           <div className="space-y-6">
             <ClientManager />
           </div>
         </TabsContent>
       </Tabs>

      <TaskModal
        task={selectedTask}
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          console.log('TaskModal onOpenChange called with:', open)
          setIsTaskModalOpen(open)
        }}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
      />
      
      {/* Debug info */}
       {process.env.NODE_ENV === 'development' && (
         <div className="fixed top-4 right-4 bg-black text-white p-2 rounded z-[9999] text-xs">
           <div>selectedTask: {selectedTask?.title || 'null'}</div>
           <div>isTaskModalOpen: {isTaskModalOpen.toString()}</div>
           <div>isTestModalOpen: {isTestModalOpen.toString()}</div>
         </div>
       )}
       
       {/* Modal de teste simples */}
       <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle>Modal de Teste</DialogTitle>
           </DialogHeader>
           <div className="p-4">
             <p>Este é um modal de teste simples para verificar se os modais estão funcionando.</p>
             <Button onClick={() => setIsTestModalOpen(false)} className="mt-4">
               Fechar
             </Button>
           </div>
         </DialogContent>
       </Dialog>

      <TaskFormModal
        task={editingTask}
        open={isTaskFormModalOpen}
        onOpenChange={setIsTaskFormModalOpen}
        onSave={handleTaskSave}
      />

      <ColumnManagerModal
        columns={columns}
        open={isColumnManagerOpen}
        onOpenChange={setIsColumnManagerOpen}
        onSave={handleColumnsSave}
      />
    </div>
  )
}