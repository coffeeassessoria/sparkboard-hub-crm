import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Target, 
  Tag,
  Edit,
  Trash2,
  Clock,
  MessageSquare,
  PhoneCall,
  Video,
  FileText
} from 'lucide-react';
import { Deal, Stage } from '@/pages/FunilVendas';
import { DealFormModal } from './deal-form-modal';

interface DealModalProps {
  deal: Deal;
  stages: Stage[];
  onClose: () => void;
  onUpdate: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
}

export const DealModal: React.FC<DealModalProps> = ({
  deal,
  stages,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive';
    case 'medium': return 'bg-warning';
    case 'low': return 'bg-success';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Não definida';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneCall className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return 'Ligação';
      case 'email': return 'E-mail';
      case 'meeting': return 'Reunião';
      case 'note': return 'Anotação';
      default: return 'Atividade';
    }
  };

  const getCurrentStage = () => {
    return stages.find(stage => stage.id === deal.stage);
  };

  const handleUpdate = (updatedDeal: Deal) => {
    onUpdate(updatedDeal);
    setIsEditMode(false);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este negócio?')) {
      onDelete(deal.id);
    }
  };

  if (isEditMode) {
    return (
      <DealFormModal
        isOpen={true}
        onClose={() => setIsEditMode(false)}
        onSubmit={handleUpdate}
        stages={stages}
        initialData={deal}
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{deal.title}</DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="w-4 h-4" />
                <span>{deal.company}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
            <TabsTrigger value="notes">Anotações</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Negócio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Valor:</span>
                    <span className="text-lg font-bold text-success">
                      {formatCurrency(deal.value)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Probabilidade:</span>
                    <Badge variant="outline">
                      <Target className="w-3 h-3 mr-1" />
                      {deal.probability}%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Etapa:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getCurrentStage()?.color}`} />
                      <span className="text-sm">{getCurrentStage()?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prioridade:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(deal.priority)}`} />
                      <span className="text-sm">{getPriorityLabel(deal.priority)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data esperada:</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <span className="text-sm font-medium">Descrição:</span>
                    <p className="text-sm text-muted-foreground">
                      {deal.description || 'Nenhuma descrição disponível'}
                    </p>
                  </div>

                  {deal.tags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {deal.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{deal.contact}</p>
                        <p className="text-xs text-muted-foreground">Contato principal</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{deal.company}</p>
                        <p className="text-xs text-muted-foreground">Empresa</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{deal.email}</p>
                        <p className="text-xs text-muted-foreground">E-mail</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{deal.phone}</p>
                        <p className="text-xs text-muted-foreground">Telefone</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Criado em: {new Date(deal.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Última atividade: {new Date(deal.lastActivity).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                {deal.activities.length > 0 ? (
                  <div className="space-y-4">
                    {deal.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {getActivityTypeLabel(activity.type)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma atividade registrada ainda
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Anotações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Funcionalidade de anotações será implementada em breve
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};