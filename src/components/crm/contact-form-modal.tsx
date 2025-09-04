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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';
import { Contact, Company } from '@/pages/CRM';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Omit<Contact, 'id' | 'createdAt'> | Contact) => void;
  companies: Company[];
  initialData?: Contact;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  companies,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    status: 'lead' as 'lead' | 'prospect' | 'customer' | 'inactive',
    lastContact: '',
    tags: [] as string[],
    source: '',
    notes: ''
  });

  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        company: initialData.company,
        position: initialData.position,
        status: initialData.status,
        lastContact: initialData.lastContact,
        tags: initialData.tags,
        source: initialData.source,
        notes: initialData.notes
      });
      setPhoneDisplay(applyPhoneMask(initialData.phone || ''));
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        status: 'lead',
        lastContact: '',
        tags: [],
        source: '',
        notes: ''
      });
      setPhoneDisplay('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Cargo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (initialData) {
        await onSubmit({
          ...initialData,
          ...formData
        });
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar contato:', error);
      // Aqui você pode adicionar um toast de erro
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: João Silva"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', normalizeEmail(e.target.value))}
                placeholder="Ex: joao@empresa.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={phoneDisplay}
                onChange={(e) => {
                  const masked = applyPhoneMask(e.target.value);
                  setPhoneDisplay(masked);
                  handleInputChange('phone', cleanPhone(masked));
                }}
                placeholder="Ex: (11) 99999-9999"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Select value={formData.company} onValueChange={(value) => handleInputChange('company', value)}>
                <SelectTrigger className={errors.company ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione ou digite empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.name}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Ou digite nova empresa"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Ex: Diretor de Marketing"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && <p className="text-sm text-red-500">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'lead' | 'prospect' | 'customer' | 'inactive') => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastContact">Último Contato</Label>
              <Input
                id="lastContact"
                type="date"
                value={formData.lastContact}
                onChange={(e) => handleInputChange('lastContact', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Como conheceu a empresa?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Cold Call">Cold Call</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Anotações importantes sobre o contato..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma tag e pressione Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Adicionar
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-sunset text-white hover:opacity-90" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')} Contato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};