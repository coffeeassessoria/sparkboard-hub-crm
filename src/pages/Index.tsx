import { 
  DollarSign, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Target,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  CheckSquare,
  User
} from "lucide-react"
import { MetricCard } from "@/components/metric-card"
import { RevenueChart, ProjectStatusChart, ClientAcquisitionChart } from "@/components/dashboard-charts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { formatCurrency } from "@/utils/currency"
import { useClients } from "@/hooks/useClients"
import { useProjects } from "@/hooks/useProjects"
import { useTasks } from "@/hooks/useTasks"
import { useDeals } from "@/hooks/useDeals"
import { useEffect, useState } from "react"

const Index = () => {
  const { clients, loading: clientsLoading } = useClients()
  const { projects, loading: projectsLoading } = useProjects()
  const { tasks, loading: tasksLoading } = useTasks()
  const { deals, getStatistics, loading: dealsLoading } = useDeals()
  const [dealStats, setDealStats] = useState(null)

  useEffect(() => {
    const loadDealStats = async () => {
      const stats = await getStatistics()
      setDealStats(stats)
    }
    loadDealStats()
  }, [])

  // Filtrar tarefas pendentes
  const pendingTasks = tasks.filter(task => 
    task.status === 'TODO' || task.status === 'EM_PROGRESSO'
  ).slice(0, 5)

  // Calcular métricas
  const activeClients = clients.filter(client => client.status === 'ATIVO').length
  const activeProjects = projects.filter(project => 
    project.status === 'EM_ANDAMENTO' || project.status === 'PLANEJAMENTO'
  ).length
  const totalRevenue = dealStats?.totalValue || 0
  const averageTicket = activeClients > 0 ? totalRevenue / activeClients : 0

  // Filtrar deals por status
  const dealsVencendo = deals.filter(deal => {
    if (deal.status !== 'PROPOSTA' && deal.status !== 'NEGOCIACAO') return false
    if (!deal.expectedCloseDate) return false
    
    const closeDate = new Date(deal.expectedCloseDate)
    const today = new Date()
    const diffTime = closeDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays <= 30 && diffDays > 0
  })

  const dealsVencidos = deals.filter(deal => {
    if (deal.status !== 'PROPOSTA' && deal.status !== 'NEGOCIACAO') return false
    if (!deal.expectedCloseDate) return false
    
    const closeDate = new Date(deal.expectedCloseDate)
    const today = new Date()
    
    return closeDate < today
  })

  const totalContratosVencendo = dealsVencendo.length
  const totalContratosVencidos = dealsVencidos.length
  const valorContratosVencendo = dealsVencendo.reduce((total, deal) => total + deal.value, 0)

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold font-poppins bg-gradient-sunset bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho da sua agência
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Receita Total"
          value={dealsLoading ? "Carregando..." : formatCurrency(totalRevenue)}
          change="12.5%"
          changeType="positive"
          icon={DollarSign}
          gradientClass="bg-gradient-sunset"
          description={`${dealStats?.total || 0} deals no total`}
        />
        
        <MetricCard
          title="Clientes Ativos"
          value={clientsLoading ? "..." : activeClients.toString()}
          change="8.2%"
          changeType="positive"
          icon={Users}
          gradientClass="bg-gradient-ocean"
          description={`${clients.length} clientes no total`}
        />
        
        <MetricCard
          title="Projetos Ativos"
          value={projectsLoading ? "..." : activeProjects.toString()}
          change="3.1%"
          changeType="positive"
          icon={Briefcase}
          gradientClass="bg-gradient-tropical"
          description={`${projects.length} projetos no total`}
        />
        
        <MetricCard
          title="Taxa de Conversão"
          value="24.8%"
          change="5.4%"
          changeType="positive"
          icon={Target}
          gradientClass="bg-gradient-sunset"
          description="Leads para clientes"
        />
        
        <MetricCard
          title="Ticket Médio"
          value={dealsLoading ? "Carregando..." : formatCurrency(averageTicket)}
          change="2.1%"
          changeType="negative"
          icon={TrendingUp}
          gradientClass="bg-gradient-ocean"
          description="Baseado nos clientes ativos"
        />
        
        <MetricCard
          title="Tempo Médio"
          value="18 dias"
          change="6.8%"
          changeType="positive"
          icon={Clock}
          gradientClass="bg-gradient-tropical"
          description="Duração média dos projetos"
        />
      </div>

      {/* Gestão de Contratos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Contratos Vencendo */}
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-yellow-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Contratos Vencendo
              </CardTitle>
              <CardDescription className="text-yellow-600">
                {totalContratosVencendo} contratos vencem nos próximos 30 dias
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              {formatCurrency(valorContratosVencendo)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dealsVencendo.slice(0, 3).map((deal) => {
                const closeDate = new Date(deal.expectedCloseDate)
                const today = new Date()
                const diffTime = closeDate.getTime() - today.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{deal.title}</div>
                      <div className="text-sm text-muted-foreground">{deal.client?.name || 'Cliente não informado'}</div>
                      <div className="text-xs text-yellow-600 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Vence em {diffDays} dias
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(deal.value)}
                      </div>
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {dealsVencendo.length > 3 && (
                <div className="text-center pt-2">
                  <Link to="/financeiro">
                    <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                      Ver todos ({dealsVencendo.length})
                    </Button>
                  </Link>
                </div>
              )}
              {dealsVencendo.length === 0 && (
                <div className="text-center py-4 text-yellow-600">
                  Nenhum contrato vencendo nos próximos 30 dias
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contratos Vencidos */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-red-800 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Contratos Vencidos
              </CardTitle>
              <CardDescription className="text-red-600">
                {totalContratosVencidos} contratos precisam de renovação urgente
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              Ação Necessária
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dealsVencidos.slice(0, 3).map((deal) => {
                const closeDate = new Date(deal.expectedCloseDate)
                const today = new Date()
                const diffTime = today.getTime() - closeDate.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{deal.title}</div>
                      <div className="text-sm text-muted-foreground">{deal.client?.name || 'Cliente não informado'}</div>
                      <div className="text-xs text-red-600 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        Vencido há {diffDays} dias
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(deal.value)}
                      </div>
                      <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                        {deal.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
              {dealsVencidos.length > 3 && (
                <div className="text-center pt-2">
                  <Link to="/financeiro">
                    <Button variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-100">
                      Ver todos ({dealsVencidos.length})
                    </Button>
                  </Link>
                </div>
              )}
              {dealsVencidos.length === 0 && (
                <div className="text-center py-4 text-red-600">
                  Nenhum contrato vencido
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Minhas Tarefas */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2" />
              Minhas Tarefas
            </CardTitle>
            <CardDescription className="text-blue-600">
              {pendingTasks.length} tarefas pendentes nos seus projetos
            </CardDescription>
          </div>
          <Link to="/projetos">
            <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
              Ver Projetos
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{task.title}</div>
                    <div className="text-sm text-muted-foreground">{task.project?.name || 'Projeto não informado'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                        {task.status}
                      </Badge>
                      {task.dueDate && (
                        <div className="text-xs text-blue-600 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.priority === 'ALTA' ? 'bg-red-100 text-red-800' :
                        task.priority === 'MEDIA' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignee}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-blue-600">
                Nenhuma tarefa pendente encontrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <RevenueChart />
        <ProjectStatusChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-1">
        <ClientAcquisitionChart />
      </div>
    </div>
  );
};

export default Index;
