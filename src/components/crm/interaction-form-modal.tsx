import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contact, Interaction } from '@/pages/CRM';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (interaction: Omit<Interaction, 'id'> | Interaction) => void;
  contacts: Contact[];
  initialData?: Interaction;
}

export const InteractionFormModal: React.FC<InteractionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contacts,
  initialData
}) => {
  const [formData, setFormData] = useState({
    contactId: '',
    contactName: '',
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    subject: '',
    description: '',
    date: '',
    duration: undefined as number | undefined,
    outcome: 'neutral' as 'positive' | 'neutral' | 'negative',
    followUp: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        contactId: initialData.contactId,
        contactName: initialData.contactName,
        type: initialData.type,
        subject: initialData.subject,
        description: initialData.description,
        date: initialData.date,
        duration: initialData.duration,
        outcome: initialData.outcome,
        followUp: initialData.followUp || ''
      });
    } else {
      setFormData({
        contactId: '',
        contactName: '',
        type: 'call',
        subject: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        duration: undefined,
        outcome: 'neutral',
        followUp: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.contactId) {
      newErrors.contactId = 'Contato é obrigatório';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (initialData) {
      onSubmit({
        ...initialData,
        ...formData
      });
    } else {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        contactId,
        contactName: contact.name
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Interação' : 'Nova Interação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Contato *</Label>
              <Select 
                value={formData.contactId} 
                onValueChange={handleContactSelect}
              >
                <SelectTrigger className={errors.contactId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um contato" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} - {contact.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contactId && <p className="text-sm text-red-500">{errors.contactId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Interação</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'call' | 'email' | 'meeting' | 'note') => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="note">Anotação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Ex: Proposta comercial"
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Ex: 30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Resultado</Label>
              <Select 
                value={formData.outcome} 
                onValueChange={(value: 'positive' | 'neutral' | 'negative') => handleInputChange('outcome', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Positivo
                    </div>
                  </SelectItem>
                  <SelectItem value="neutral">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Neutro
                    </div>
                  </SelectItem>
                  <SelectItem value="negative">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Negativo
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUp">Data de Follow-up</Label>
              <Input
                id="followUp"
                type="date"
                value={formData.followUp}
                onChange={(e) => handleInputChange('followUp', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o que foi discutido na interação..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-sunset text-white hover:opacity-90">
              {initialData ? 'Atualizar' : 'Criar'} Interação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};