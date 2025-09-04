import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Copy, FileText, Folder, Clock, Users } from "lucide-react"
import { toast } from "sonner"

interface TaskTemplate {
  id: string
  name: string
  description: string
  title: string
  taskDescription: string
  priority: "low" | "medium" | "high" | "urgent"
  estimatedHours: number
  tags: string[]
  category: string
  createdAt: string
  createdBy: string
}

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: string
  columns: string[]
  tasks: TaskTemplate[]
  estimatedDuration: number
  teamSize: number
  createdAt: string
  createdBy: string
}

interface TemplateManagerProps {
  onApplyTemplate?: (template: ProjectTemplate | TaskTemplate, type: 'project' | 'task') => void
}

export default function TemplateManager({ onApplyTemplate }: TemplateManagerProps) {
  const [activeTab, setActiveTab] = useState("project-templates")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | TaskTemplate | null>(null)
  const [templateType, setTemplateType] = useState<'project' | 'task'>('project')
  const [deletingTemplates, setDeletingTemplates] = useState<Set<string>>(new Set())

  // Mock data - em produção viria de uma API
  const [projectTemplates, setProjectTemplates] = useState<ProjectTemplate[]>([
    {
      id: "template-1",
      name: "Website Institucional",
      description: "Template completo para desenvolvimento de website institucional",
      category: "Desenvolvimento Web",
      columns: ["Briefing", "Design", "Desenvolvimento", "Testes", "Entrega"],
      tasks: [
        {
          id: "task-1",
          name: "Briefing com Cliente",
          description: "Reunião inicial para entender necessidades",
          title: "Briefing com Cliente",
          taskDescription: "Realizar reunião inicial com o cliente para entender suas necessidades, objetivos e expectativas para o website institucional.",
          priority: "high",
          estimatedHours: 2,
          tags: ["briefing", "cliente", "planejamento"],
          category: "Planejamento",
          createdAt: new Date().toISOString(),
          createdBy: "Sistema"
        },
        {
          id: "task-2",
          name: "Wireframes",
          description: "Criação de wireframes das páginas",
          title: "Criação de Wireframes",
          taskDescription: "Desenvolver wireframes detalhados para todas as páginas do website, definindo estrutura e layout.",
          priority: "medium",
          estimatedHours: 8,
          tags: ["design", "wireframe", "ux"],
          category: "Design",
          createdAt: new Date().toISOString(),
          createdBy: "Sistema"
        }
      ],
      estimatedDuration: 30,
      teamSize: 3,
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    },
    {
      id: "template-2",
      name: "Campanha de Marketing Digital",
      description: "Template para campanhas completas de marketing digital",
      category: "Marketing",
      columns: ["Estratégia", "Criação", "Aprovação", "Veiculação", "Análise"],
      tasks: [
        {
          id: "task-3",
          name: "Definição de Persona",
          description: "Criação de personas para a campanha",
          title: "Definição de Persona",
          taskDescription: "Definir personas detalhadas para direcionamento da campanha de marketing digital.",
          priority: "high",
          estimatedHours: 4,
          tags: ["persona", "estratégia", "marketing"],
          category: "Estratégia",
          createdAt: new Date().toISOString(),
          createdBy: "Sistema"
        }
      ],
      estimatedDuration: 15,
      teamSize: 2,
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    }
  ])

  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([
    {
      id: "task-template-1",
      name: "Reunião de Briefing",
      description: "Template para reuniões de briefing com clientes",
      title: "Reunião de Briefing",
      taskDescription: "Realizar reunião de briefing com o cliente para entender necessidades e objetivos do projeto.",
      priority: "high",
      estimatedHours: 2,
      tags: ["briefing", "cliente", "reunião"],
      category: "Planejamento",
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    },
    {
      id: "task-template-2",
      name: "Criação de Mockup",
      description: "Template para criação de mockups de design",
      title: "Criação de Mockup",
      taskDescription: "Desenvolver mockups detalhados baseados nos wireframes aprovados.",
      priority: "medium",
      estimatedHours: 6,
      tags: ["design", "mockup", "visual"],
      category: "Design",
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    },
    {
      id: "task-template-3",
      name: "Revisão de Conteúdo",
      description: "Template para revisão de textos e conteúdos",
      title: "Revisão de Conteúdo",
      taskDescription: "Revisar todos os textos e conteúdos do projeto, verificando gramática, ortografia e adequação ao tom de voz da marca.",
      priority: "medium",
      estimatedHours: 3,
      tags: ["revisão", "conteúdo", "texto"],
      category: "Conteúdo",
      createdAt: new Date().toISOString(),
      createdBy: "Admin"
    }
  ])

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    estimatedDuration: 0,
    teamSize: 1
  })

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error("Nome do template é obrigatório")
      return
    }

    const template = {
      id: `template-${Date.now()}`,
      ...newTemplate,
      columns: templateType === 'project' ? ["A Fazer", "Em Andamento", "Concluído"] : [],
      tasks: [],
      createdAt: new Date().toISOString(),
      createdBy: "Usuário Atual"
    }

    if (templateType === 'project') {
      setProjectTemplates(prev => [...prev, template as ProjectTemplate])
    } else {
      // Para task templates, criar estrutura diferente
      const taskTemplate: TaskTemplate = {
        id: `task-template-${Date.now()}`,
        name: newTemplate.name,
        description: newTemplate.description,
        title: newTemplate.name,
        taskDescription: newTemplate.description,
        priority: "medium",
        estimatedHours: newTemplate.estimatedDuration,
        tags: [],
        category: newTemplate.category,
        createdAt: new Date().toISOString(),
        createdBy: "Usuário Atual"
      }
      setTaskTemplates(prev => [...prev, taskTemplate])
    }

    setNewTemplate({ name: "", description: "", category: "", estimatedDuration: 0, teamSize: 1 })
    setIsCreateDialogOpen(false)
    toast.success(`Template ${templateType === 'project' ? 'de projeto' : 'de tarefa'} criado com sucesso!`)
  }

  const handleApplyTemplate = (template: ProjectTemplate | TaskTemplate, type: 'project' | 'task') => {
    onApplyTemplate?.(template, type)
    toast.success(`Template aplicado com sucesso!`)
  }

  const handleDeleteTemplate = async (id: string, type: 'project' | 'task') => {
    setDeletingTemplates(prev => new Set(prev).add(id))
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (type === 'project') {
        setProjectTemplates(prev => prev.filter(t => t.id !== id))
      } else {
        setTaskTemplates(prev => prev.filter(t => t.id !== id))
      }
      toast.success("Template excluído com sucesso!")
    } catch (error) {
      toast.error("Erro ao excluir template")
    } finally {
      setDeletingTemplates(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'desenvolvimento web':
      case 'desenvolvimento':
        return <FileText className="w-4 h-4" />
      case 'marketing':
        return <Users className="w-4 h-4" />
      case 'design':
        return <Edit className="w-4 h-4" />
      default:
        return <Folder className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive'
      case 'high': return 'bg-accent'
      case 'medium': return 'bg-warning'
      case 'low': return 'bg-success'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Templates</h2>
          <p className="text-muted-foreground">
            Gerencie templates de projetos e tarefas para agilizar o trabalho da agência
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Template</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Template</Label>
                <Select value={templateType} onValueChange={(value: 'project' | 'task') => setTemplateType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Projeto</SelectItem>
                    <SelectItem value="task">Tarefa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do template"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do template"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Desenvolvimento Web, Marketing"
                />
              </div>
              
              {templateType === 'project' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (dias)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTemplate.estimatedDuration}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Tamanho da Equipe</Label>
                    <Input
                      id="teamSize"
                      type="number"
                      value={newTemplate.teamSize}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
              )}
              
              {templateType === 'task' && (
                <div className="space-y-2">
                  <Label htmlFor="hours">Horas Estimadas</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    value={newTemplate.estimatedDuration}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, estimatedDuration: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateTemplate}>
                  Criar Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="project-templates">
            <Folder className="w-4 h-4 mr-2" />
            Templates de Projeto
          </TabsTrigger>
          <TabsTrigger value="task-templates">
            <FileText className="w-4 h-4 mr-2" />
            Templates de Tarefa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="project-templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimatedDuration} dias
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {template.teamSize} pessoas
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Colunas:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.columns.map((column, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {column}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{template.tasks.length} tarefas incluídas</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleApplyTemplate(template, 'project')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Aplicar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id, 'project')}
                      disabled={deletingTemplates.has(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="task-templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.estimatedHours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(template.priority)}`} />
                      {template.priority}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleApplyTemplate(template, 'task')}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Aplicar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteTemplate(template.id, 'task')}
                      disabled={deletingTemplates.has(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}