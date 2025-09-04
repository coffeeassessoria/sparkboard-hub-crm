import React, { useState } from 'react';
import { Plus, Users, Building2, Phone, Mail, Calendar, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContactFormModal } from '@/components/crm/contact-form-modal';
import { ContactModal } from '@/components/crm/contact-modal';
import { CompanyFormModal } from '@/components/crm/company-form-modal';
import { InteractionFormModal } from '@/components/crm/interaction-form-modal';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  lastContact: string;
  tags: string[];
  source: string;
  createdAt: string;
  notes: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  industry: string;
  size: string;
  status: 'active' | 'inactive' | 'prospect';
  contacts: number;
  createdAt: string;
}

export interface Interaction {
  id: string;
  contactId: string;
  contactName: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  subject: string;
  description: string;
  date: string;
  duration?: number;
  outcome: 'positive' | 'neutral' | 'negative';
  followUp?: string;
}

const CRM: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@empresaabc.com',
      phone: '(11) 99999-9999',
      company: 'Empresa ABC',
      position: 'Diretor de Marketing',
      status: 'customer',
      lastContact: '2024-01-15',
      tags: ['VIP', 'Decisor'],
      source: 'Indicação',
      createdAt: '2024-01-01',
      notes: 'Cliente muito interessado em nossos serviços de marketing digital.'
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@startupxyz.com',
      phone: '(11) 88888-8888',
      company: 'Startup XYZ',
      position: 'CEO',
      status: 'prospect',
      lastContact: '2024-01-10',
      tags: ['Tech', 'Startup'],
      source: 'LinkedIn',
      createdAt: '2024-01-05',
      notes: 'Startup em crescimento, potencial para parceria de longo prazo.'
    }
  ]);

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Empresa ABC',
      email: 'contato@empresaabc.com',
      phone: '(11) 3333-3333',
      website: 'www.empresaabc.com',
      address: 'São Paulo, SP',
      industry: 'Tecnologia',
      size: '50-100',
      status: 'active',
      contacts: 3,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Startup XYZ',
      email: 'hello@startupxyz.com',
      phone: '(11) 2222-2222',
      website: 'www.startupxyz.com',
      address: 'Rio de Janeiro, RJ',
      industry: 'Fintech',
      size: '10-50',
      status: 'prospect',
      contacts: 1,
      createdAt: '2024-01-05'
    }
  ]);

  const [interactions, setInteractions] = useState<Interaction[]>([
    {
      id: '1',
      contactId: '1',
      contactName: 'João Silva',
      type: 'call',
      subject: 'Proposta de Marketing Digital',
      description: 'Discussão sobre campanha de marketing digital para Q1 2024',
      date: '2024-01-15',
      duration: 45,
      outcome: 'positive',
      followUp: '2024-01-22'
    },
    {
      id: '2',
      contactId: '2',
      contactName: 'Maria Santos',
      type: 'email',
      subject: 'Apresentação da Agência',
      description: 'Envio de apresentação institucional e cases de sucesso',
      date: '2024-01-10',
      outcome: 'neutral',
      followUp: '2024-01-17'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('contacts');

  // Modal states
  const [contactFormModal, setContactFormModal] = useState({ isOpen: false, contact: null as Contact | null });
  const [contactModal, setContactModal] = useState({ isOpen: false, contact: null as Contact | null });
  const [companyFormModal, setCompanyFormModal] = useState({ isOpen: false, company: null as Company | null });
  const [interactionFormModal, setInteractionFormModal] = useState({ isOpen: false, interaction: null as Interaction | null });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'customer': return 'bg-success text-success-foreground';
      case 'prospect': return 'bg-warning text-warning-foreground';
      case 'lead': return 'bg-info text-info-foreground';
      case 'active': return 'bg-success text-success-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getInteractionTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleContactSubmit = (contactData: Omit<Contact, 'id' | 'createdAt'> | Contact) => {
    if ('id' in contactData) {
      setContacts(prev => prev.map(c => c.id === contactData.id ? { ...contactData } : c));
    } else {
      const newContact: Contact = {
        ...contactData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      };
      setContacts(prev => [...prev, newContact]);
    }
    setContactFormModal({ isOpen: false, contact: null });
  };

  const handleCompanySubmit = (companyData: Omit<Company, 'id' | 'createdAt' | 'contacts'> | Company) => {
    if ('id' in companyData) {
      setCompanies(prev => prev.map(c => c.id === companyData.id ? { ...companyData } : c));
    } else {
      const newCompany: Company = {
        ...companyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        contacts: 0
      };
      setCompanies(prev => [...prev, newCompany]);
    }
    setCompanyFormModal({ isOpen: false, company: null });
  };

  const handleInteractionSubmit = (interactionData: Omit<Interaction, 'id'> | Interaction) => {
    if ('id' in interactionData) {
      setInteractions(prev => prev.map(i => i.id === interactionData.id ? { ...interactionData } : i));
    } else {
      const newInteraction: Interaction = {
        ...interactionData,
        id: Date.now().toString()
      };
      setInteractions(prev => [...prev, newInteraction]);
    }
    setInteractionFormModal({ isOpen: false, interaction: null });
  };

  const deleteContact = (contactId: string) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  };

  const deleteCompany = (companyId: string) => {
    setCompanies(prev => prev.filter(c => c.id !== companyId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM</h1>
          <p className="text-muted-foreground">Gerencie seus contatos, empresas e interações</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Contatos</p>
                <p className="text-2xl font-bold text-foreground">{contacts.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold text-foreground">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold text-foreground">
                  {contacts.filter(c => c.status === 'customer').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interações</p>
                <p className="text-2xl font-bold text-foreground">{interactions.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contatos, empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="lead">Leads</option>
            <option value="prospect">Prospects</option>
            <option value="customer">Clientes</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">Contatos</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="interactions">Interações</TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Contatos</h2>
            <Button 
              onClick={() => setContactFormModal({ isOpen: true, contact: null })}
              className="bg-gradient-sunset text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="glass-card hover-lift cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-sunset rounded-full flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.position} - {contact.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{contact.email}</span>
                          <Phone className="w-3 h-3 text-muted-foreground ml-2" />
                          <span className="text-xs text-muted-foreground">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      <div className="flex gap-1">
                        {contact.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setContactModal({ isOpen: true, contact })}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setContactFormModal({ isOpen: true, contact })}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteContact(contact.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Empresas</h2>
            <Button 
              onClick={() => setCompanyFormModal({ isOpen: true, company: null })}
              className="bg-gradient-sunset text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredCompanies.map((company) => (
              <Card key={company.id} className="glass-card hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-ocean rounded-lg flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.industry} • {company.size} funcionários</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{company.email}</span>
                          <Users className="w-3 h-3 text-muted-foreground ml-2" />
                          <span className="text-xs text-muted-foreground">{company.contacts} contatos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setCompanyFormModal({ isOpen: true, company })}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteCompany(company.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Interactions Tab */}
        <TabsContent value="interactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Interações</h2>
            <Button 
              onClick={() => setInteractionFormModal({ isOpen: true, interaction: null })}
              className="bg-gradient-sunset text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Interação
            </Button>
          </div>

          <div className="grid gap-4">
            {interactions.map((interaction) => (
              <Card key={interaction.id} className="glass-card hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-tropical rounded-lg flex items-center justify-center text-white">
                        {getInteractionTypeIcon(interaction.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{interaction.subject}</h3>
                        <p className="text-sm text-muted-foreground">
                          {interaction.contactName} • {interaction.type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {interaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {interaction.date}
                          {interaction.duration && ` • ${interaction.duration} min`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={
                          interaction.outcome === 'positive' ? 'bg-success text-success-foreground' :
                          interaction.outcome === 'negative' ? 'bg-destructive text-destructive-foreground' :
                          'bg-warning text-warning-foreground'
                        }
                      >
                        {interaction.outcome}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setInteractionFormModal({ isOpen: true, interaction })}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setInteractions(prev => prev.filter(i => i.id !== interaction.id))}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ContactFormModal
        isOpen={contactFormModal.isOpen}
        onClose={() => setContactFormModal({ isOpen: false, contact: null })}
        onSubmit={handleContactSubmit}
        companies={companies}
        initialData={contactFormModal.contact}
      />

      <ContactModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, contact: null })}
        contact={contactModal.contact}
        onEdit={(contact) => {
          setContactModal({ isOpen: false, contact: null });
          setContactFormModal({ isOpen: true, contact });
        }}
        interactions={interactions.filter(i => i.contactId === contactModal.contact?.id)}
      />

      <CompanyFormModal
        isOpen={companyFormModal.isOpen}
        onClose={() => setCompanyFormModal({ isOpen: false, company: null })}
        onSubmit={handleCompanySubmit}
        initialData={companyFormModal.company}
      />

      <InteractionFormModal
        isOpen={interactionFormModal.isOpen}
        onClose={() => setInteractionFormModal({ isOpen: false, interaction: null })}
        onSubmit={handleInteractionSubmit}
        contacts={contacts}
        initialData={interactionFormModal.interaction}
      />
    </div>
  );
};

export default CRM;