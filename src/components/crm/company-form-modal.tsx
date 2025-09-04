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
import { Company } from '@/pages/CRM';
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (company: Omit<Company, 'id' | 'createdAt' | 'contacts'> | Company) => void;
  initialData?: Company;
}

export const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    industry: '',
    size: '',
    status: 'prospect' as 'active' | 'inactive' | 'prospect'
  });

  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
        website: initialData.website,
        address: initialData.address,
        industry: initialData.industry,
        size: initialData.size,
        status: initialData.status
      });
      setPhoneDisplay(applyPhoneMask(initialData.phone || ''));
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        industry: '',
        size: '',
        status: 'prospect'
      });
      setPhoneDisplay('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Setor é obrigatório';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Empresa ABC Ltda"
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
                placeholder="Ex: contato@empresa.com"
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
                placeholder="Ex: (11) 3333-3333"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Ex: www.empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Setor *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className={errors.industry ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Varejo">Varejo</SelectItem>
                  <SelectItem value="Manufatura">Manufatura</SelectItem>
                  <SelectItem value="Serviços">Serviços</SelectItem>
                  <SelectItem value="Consultoria">Consultoria</SelectItem>
                  <SelectItem value="Agência">Agência</SelectItem>
                  <SelectItem value="Startup">Startup</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamanho da Empresa</Label>
              <Select value={formData.size} onValueChange={(value) => handleInputChange('size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 funcionários</SelectItem>
                  <SelectItem value="10-50">10-50 funcionários</SelectItem>
                  <SelectItem value="50-100">50-100 funcionários</SelectItem>
                  <SelectItem value="100-500">100-500 funcionários</SelectItem>
                  <SelectItem value="500+">500+ funcionários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'prospect') => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ex: São Paulo, SP - Brasil"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-sunset text-white hover:opacity-90">
              {initialData ? 'Atualizar' : 'Criar'} Empresa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};