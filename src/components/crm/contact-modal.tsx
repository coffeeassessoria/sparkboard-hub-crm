import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Tag, 
  FileText, 
  Edit,
  MessageSquare
} from 'lucide-react';
import { Contact, Interaction } from '@/pages/CRM';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onEdit: (contact: Contact) => void;
  interactions: Interaction[];
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onEdit,
  interactions
}) => {
  if (!contact) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-success text-success-foreground';
      case 'prospect': return 'bg-warning text-warning-foreground';
      case 'lead': return 'bg-info text-info-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getInteractionTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'positive': return 'bg-success text-success-foreground';
      case 'negative': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-warning text-warning-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-sunset rounded-full flex items-center justify-center text-white text-xl font-bold">
                {contact.name.charAt(0)}
              </div>
              <div>
                <DialogTitle className="text-2xl">{contact.name}</DialogTitle>
                <p className="text-muted-foreground">{contact.position} - {contact.company}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                  {contact.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={() => onEdit(contact)} className="bg-gradient-sunset text-white hover:opacity-90">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações de Contato
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{contact.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{contact.company}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Último contato: {contact.lastContact || 'Nunca'}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Detalhes Adicionais
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Origem:</span>
                  <p className="text-sm">{contact.source || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data de Criação:</span>
                  <p className="text-sm">{contact.createdAt}</p>
                </div>
              </div>
            </div>

            {contact.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Observações
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contact.notes}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Interactions History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Histórico de Interações ({interactions.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {interactions.length > 0 ? (
                interactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg p-4 bg-card">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getInteractionTypeIcon(interaction.type)}
                          <span className="font-medium text-sm">{interaction.subject}</span>
                        </div>
                        <Badge className={getOutcomeColor(interaction.outcome)} variant="outline">
                          {interaction.outcome}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {interaction.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{interaction.date}</span>
                        {interaction.duration && (
                          <span>{interaction.duration} min</span>
                        )}
                      </div>
                      
                      {interaction.followUp && (
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Follow-up:</span>
                          <span className="ml-1 text-muted-foreground">{interaction.followUp}</span>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma interação registrada</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};