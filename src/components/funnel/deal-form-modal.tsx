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
import { Deal, Stage } from '@/pages/FunilVendas';
import { applyCurrencyMask, parseCurrency, formatCurrency } from '@/utils/currency';
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';

interface DealFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deal: Omit<Deal, 'id' | 'createdAt' | 'lastActivity' | 'activities'> | Deal) => void;
  stages: Stage[];
  initialData?: Deal;
}

export const DealFormModal: React.FC<DealFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stages,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    contact: '',
    email: '',
    phone: '',
    value: 0,
    probability: 0,
    expectedCloseDate: '',
    stage: 'leads',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tags: [] as string[]
  });

  const [valueDisplay, setValueDisplay] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        company: initialData.company,
        contact: initialData.contact,
        email: initialData.email,
        phone: initialData.phone,
        value: initialData.value,
        probability: initialData.probability,
        expectedCloseDate: initialData.expectedCloseDate,
        stage: initialData.stage,
        description: initialData.description,
        priority: initialData.priority,
        tags: initialData.tags
      });
      setValueDisplay(formatCurrency(initialData.value));
      setPhoneDisplay(applyPhoneMask(initialData.phone));
    } else {
      setFormData({
        title: '',
        company: '',
        contact: '',
        email: '',
        phone: '',
        value: 0,
        probability: 0,
        expectedCloseDate: '',
        stage: 'leads',
        description: '',
        priority: 'medium',
        tags: []
      });
      setValueDisplay('');
      setPhoneDisplay('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Empresa é obrigatória';
    }

    if (!formData.contact.trim()) {
      newErrors.contact = 'Contato é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Valor deve ser maior que zero';
    }

    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probabilidade deve estar entre 0 e 100';
    }

    if (!formData.expectedCloseDate) {
      newErrors.expectedCloseDate = 'Data esperada é obrigatória';
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
      console.error('Erro ao salvar negócio:', error);
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
            {initialData ? 'Editar Negócio' : 'Novo Negócio'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ex: Sistema ERP para Empresa XYZ"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Ex: Empresa XYZ Ltda"
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contato *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="Ex: João Silva"
                className={errors.contact ? 'border-red-500' : ''}
              />
              {errors.contact && <p className="text-sm text-red-500">{errors.contact}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', normalizeEmail(e.target.value))}
                placeholder="Ex: cliente@empresa.com"
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
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input
                id="value"
                type="text"
                value={valueDisplay}
                onChange={(e) => {
                  const masked = applyCurrencyMask(e.target.value);
                  setValueDisplay(masked);
                  const numericValue = parseCurrency(masked);
                  handleInputChange('value', numericValue);
                }}
                placeholder="R$ 0,00"
                className={errors.value ? 'border-red-500' : ''}
              />
              {errors.value && <p className="text-sm text-red-500">{errors.value}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%) *</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 0)}
                placeholder="Ex: 70"
                className={errors.probability ? 'border-red-500' : ''}
              />
              {errors.probability && <p className="text-sm text-red-500">{errors.probability}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedCloseDate">Data Esperada *</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => handleInputChange('expectedCloseDate', e.target.value)}
                className={errors.expectedCloseDate ? 'border-red-500' : ''}
              />
              {errors.expectedCloseDate && (
                <p className="text-sm text-red-500">{errors.expectedCloseDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Etapa</Label>
              <Select value={formData.stage} onValueChange={(value) => handleInputChange('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        {stage.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Baixa
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      Média
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      Alta
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os detalhes do negócio..."
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (initialData ? 'Atualizar' : 'Criar')} Negócio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};