import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreVertical, DollarSign, Calendar, User, Building, Phone, Mail, Target, Settings, TrendingUp } from 'lucide-react';
import { DealModal } from '@/components/funnel/deal-modal';
import { DealFormModal } from '@/components/funnel/deal-form-modal';
import { StageManagerModal } from '@/components/funnel/stage-manager-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  value: number;
  probability: number;
  expectedCloseDate: string;
  stage: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  lastActivity: string;
  activities: Array<{
    id: string;
    type: 'call' | 'email' | 'meeting' | 'note';
    description: string;
    date: string;
  }>;
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
}

const FunilVendas = () => {
  const [stages, setStages] = useState<Stage[]>([
    { id: 'leads', name: 'Leads', color: 'bg-primary', order: 0 },
    { id: 'qualified', name: 'Qualificados', color: 'bg-warning', order: 1 },
    { id: 'proposal', name: 'Proposta', color: 'bg-secondary', order: 2 },
    { id: 'negotiation', name: 'Negociação', color: 'bg-accent', order: 3 },
    { id: 'closed-won', name: 'Fechado - Ganho', color: 'bg-success', order: 4 },
    { id: 'closed-lost', name: 'Fechado - Perdido', color: 'bg-destructive', order: 5 },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      title: 'Sistema ERP para Empresa XYZ',
      company: 'Empresa XYZ Ltda',
      contact: 'João Silva',
      email: 'joao@empresaxyz.com',
      phone: '(11) 99999-9999',
      value: 150000,
      probability: 70,
      expectedCloseDate: '2024-02-15',
      stage: 'proposal',
      description: 'Implementação completa de sistema ERP para gestão empresarial',
      priority: 'high',
      tags: ['ERP', 'Implementação', 'Grande Porte'],
      createdAt: '2024-01-10',
      lastActivity: '2024-01-15',
      activities: [
        { id: '1', type: 'call', description: 'Ligação inicial de prospecção', date: '2024-01-10' },
        { id: '2', type: 'meeting', description: 'Reunião de apresentação da proposta', date: '2024-01-15' }
      ]
    },
    {
      id: '2',
      title: 'App Mobile para Delivery',
      company: 'RestaurantePlus',
      contact: 'Maria Santos',
      email: 'maria@restauranteplus.com',
      phone: '(11) 88888-8888',
      value: 75000,
      probability: 90,
      expectedCloseDate: '2024-01-30',
      stage: 'negotiation',
      description: 'Desenvolvimento de aplicativo mobile para delivery de comida',
      priority: 'medium',
      tags: ['Mobile', 'Delivery', 'App'],
      createdAt: '2024-01-05',
      lastActivity: '2024-01-16',
      activities: [
        { id: '3', type: 'email', description: 'Envio de proposta comercial', date: '2024-01-12' },
        { id: '4', type: 'call', description: 'Negociação de preços', date: '2024-01-16' }
      ]
    },
    {
      id: '3',
      title: 'Website Institucional',
      company: 'Clínica MedVida',
      contact: 'Dr. Carlos',
      email: 'carlos@medvida.com',
      phone: '(11) 77777-7777',
      value: 25000,
      probability: 50,
      expectedCloseDate: '2024-02-28',
      stage: 'qualified',
      description: 'Desenvolvimento de website institucional para clínica médica',
      priority: 'low',
      tags: ['Website', 'Saúde', 'Institucional'],
      createdAt: '2024-01-08',
      lastActivity: '2024-01-14',
      activities: [
        { id: '5', type: 'meeting', description: 'Levantamento de requisitos', date: '2024-01-14' }
      ]
    }
  ]);

  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const deal = deals.find(d => d.id === draggableId);
    if (!deal) return;

    const updatedDeals = deals.map(d =>
      d.id === draggableId ? { ...d, stage: destination.droppableId } : d
    );

    setDeals(updatedDeals);
    toast({
      title: "Negócio movido",
      description: `${deal.title} foi movido para ${stages.find(s => s.id === destination.droppableId)?.name}`,
    });
  };

  const handleCreateDeal = (dealData: Omit<Deal, 'id' | 'createdAt' | 'lastActivity' | 'activities'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      activities: []
    };

    setDeals([...deals, newDeal]);
    setIsFormModalOpen(false);
    toast({
      title: "Negócio criado",
      description: "Novo negócio adicionado ao funil de vendas",
    });
  };

  const handleUpdateDeal = (updatedDeal: Deal) => {
    setDeals(deals.map(d => d.id === updatedDeal.id ? updatedDeal : d));
    setSelectedDeal(null);
    toast({
      title: "Negócio atualizado",
      description: "As informações do negócio foram atualizadas",
    });
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals(deals.filter(d => d.id !== dealId));
    setSelectedDeal(null);
    toast({
      title: "Negócio removido",
      description: "O negócio foi removido do funil de vendas",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
    case 'medium': return 'bg-warning';
    case 'low': return 'bg-success';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTotalValue = () => {
    return deals.reduce((total, deal) => total + deal.value, 0);
  };

  const getWeightedValue = () => {
    return deals.reduce((total, deal) => total + (deal.value * deal.probability / 100), 0);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Funil de Vendas</h1>
          <p className="text-muted-foreground">Gerencie seus negócios e oportunidades</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsStageManagerOpen(true)} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Gerenciar Etapas
          </Button>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Negócio
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total no Funil</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(getTotalValue())}</div>
                <p className="text-xs text-muted-foreground">{deals.length} negócios</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Ponderado</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(getWeightedValue())}</div>
                <p className="text-xs text-muted-foreground">Baseado na probabilidade</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((getDealsByStage('closed-won').length / (deals.length || 1)) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Negócios fechados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(getTotalValue() / (deals.length || 1))}
                </div>
                <p className="text-xs text-muted-foreground">Por negócio</p>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Board */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary">
                        {getDealsByStage(stage.id).length}
                      </Badge>
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[400px] p-2 rounded-md transition-colors ${
                            snapshot.isDraggingOver ? 'bg-muted' : ''
                          }`}
                        >
                          {getDealsByStage(stage.id).map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                  }`}
                                  onClick={() => setSelectedDeal(deal)}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-sm text-foreground line-clamp-2">
                                        {deal.title}
                                      </h4>
                                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(deal.priority)}`} />
                                    </div>

                                    <div className="space-y-2 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Building className="w-3 h-3" />
                                        <span className="truncate">{deal.company}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{deal.contact}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-sm text-foreground">
                                        {formatCurrency(deal.value)}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {deal.probability}%
                                      </Badge>
                                    </div>

                                    {deal.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {deal.tags.slice(0, 2).map((tag, tagIndex) => (
                                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {deal.tags.length > 2 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{deal.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Negócios por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stages.map((stage) => {
                    const stageDeals = getDealsByStage(stage.id);
                    const percentage = ((stageDeals.length / (deals.length || 1)) * 100).toFixed(1);
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <span className="text-sm font-medium">{stage.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {stageDeals.length} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stage.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valor por Etapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stages.map((stage) => {
                    const stageDeals = getDealsByStage(stage.id);
                    const stageValue = stageDeals.reduce((total, deal) => total + deal.value, 0);
                    const percentage = ((stageValue / (getTotalValue() || 1)) * 100).toFixed(1);
                    return (
                      <div key={stage.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <span className="text-sm font-medium">{stage.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(stageValue)} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stage.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedDeal && (
        <DealModal
          deal={selectedDeal}
          stages={stages}
          onClose={() => setSelectedDeal(null)}
          onUpdate={handleUpdateDeal}
          onDelete={handleDeleteDeal}
        />
      )}

      <DealFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateDeal}
        stages={stages}
      />

      <StageManagerModal
        isOpen={isStageManagerOpen}
        onClose={() => setIsStageManagerOpen(false)}
        stages={stages}
        onUpdateStages={setStages}
      />
    </div>
  );
};

export default FunilVendas;