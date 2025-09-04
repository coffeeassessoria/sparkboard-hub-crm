import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, User, Building, Phone, Mail, MapPin, Search } from 'lucide-react'
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';
import { applyDocumentMask, cleanDocument, validateDocument } from '@/utils/document';

export interface Cliente {
  id: string
  nome: string
  empresa?: string
  email: string
  telefone: string
  cpfCnpj: string
  endereco: {
    rua: string
    numero: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  observacoes?: string
  status: 'Ativo' | 'Inativo'
  dataCadastro: string
}

interface ClientManagerProps {
  onClientSelect?: (client: Cliente) => void
  selectedClientId?: string
}

export function ClientManager({ onClientSelect, selectedClientId }: ClientManagerProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Ativo' | 'Inativo'>('todos')
  
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [documentoDisplay, setDocumentoDisplay] = useState('')
  
  const [formData, setFormData] = useState<Omit<Cliente, 'id' | 'dataCadastro'>>({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    cpfCnpj: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    observacoes: '',
    status: 'Ativo'
  })

  // Carregar clientes do localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('sparkboard-clients')
    if (savedClients) {
      setClientes(JSON.parse(savedClients))
    }
  }, [])

  // Salvar clientes no localStorage
  useEffect(() => {
    localStorage.setItem('sparkboard-clients', JSON.stringify(clientes))
  }, [clientes])

  const resetForm = () => {
    setFormData({
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
      cpfCnpj: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      observacoes: '',
      status: 'Ativo'
    })
    setEditingClient(null)
    setPhoneDisplay('')
    setDocumentoDisplay('')
  }

  const handleSave = () => {
    if (!formData.nome || !formData.email || !formData.telefone) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    if (!validateEmail(formData.email)) {
      toast.error('Por favor, insira um email válido')
      return
    }
    
    if (!validateDocument(formData.cpfCnpj)) {
      toast.error('Por favor, insira um CPF ou CNPJ válido')
      return
    }

    if (editingClient) {
      setClientes(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...formData, id: editingClient.id, dataCadastro: editingClient.dataCadastro }
          : client
      ))
      toast.success('Cliente atualizado com sucesso!')
    } else {
      const newClient: Cliente = {
        ...formData,
        id: Date.now().toString(),
        dataCadastro: new Date().toISOString()
      }
      setClientes(prev => [...prev, newClient])
      toast.success('Cliente cadastrado com sucesso!')
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleEdit = (client: Cliente) => {
    setEditingClient(client)
    setFormData({
      nome: client.nome,
      empresa: client.empresa || '',
      email: client.email,
      telefone: client.telefone,
      cpfCnpj: client.cpfCnpj,
      endereco: client.endereco,
      observacoes: client.observacoes || '',
      status: client.status
    })
    setPhoneDisplay(applyPhoneMask(client.telefone))
    setDocumentoDisplay(applyDocumentMask(client.cpfCnpj))
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setClientes(prev => prev.filter(client => client.id !== id))
    toast.success('Cliente excluído com sucesso!')
  }

  const filteredClients = clientes.filter(client => {
    const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cpfCnpj.includes(searchTerm)
    const matchesStatus = statusFilter === 'todos' || client.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gerenciar Clientes
            </CardTitle>
            <CardDescription>
              Cadastre e gerencie seus clientes
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do cliente
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: normalizeEmail(e.target.value) }))}
                placeholder="cliente@email.com"
              />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={phoneDisplay}
                    onChange={(e) => {
                      const masked = applyPhoneMask(e.target.value);
                      setPhoneDisplay(masked);
                      setFormData(prev => ({ ...prev, telefone: cleanPhone(masked) }));
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpfCnpj"
                    value={documentoDisplay}
                    onChange={(e) => {
                      const maskedValue = applyDocumentMask(e.target.value)
                      const cleanValue = cleanDocument(e.target.value)
                      setDocumentoDisplay(maskedValue)
                      setFormData(prev => ({ ...prev, cpfCnpj: cleanValue }))
                    }}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: 'Ativo' | 'Inativo') => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="rua">Rua</Label>
                    <Input
                      id="rua"
                      value={formData.endereco.rua}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, rua: e.target.value }
                      }))}
                      placeholder="Nome da rua"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.endereco.numero}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, numero: e.target.value }
                      }))}
                      placeholder="123"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.endereco.bairro}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, bairro: e.target.value }
                      }))}
                      placeholder="Nome do bairro"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.endereco.cidade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cidade: e.target.value }
                      }))}
                      placeholder="Nome da cidade"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.endereco.estado}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, estado: e.target.value }
                      }))}
                      placeholder="SP"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.endereco.cep}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        endereco: { ...prev.endereco, cep: e.target.value }
                      }))}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações adicionais sobre o cliente"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingClient ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF/CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id}
                    className={selectedClientId === client.id ? 'bg-muted' : ''}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{client.nome}</div>
                        {client.empresa && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {client.empresa}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.telefone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'Ativo' ? 'default' : 'secondary'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(client.dataCadastro).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onClientSelect && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onClientSelect(client)}
                          >
                            Selecionar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(client)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}