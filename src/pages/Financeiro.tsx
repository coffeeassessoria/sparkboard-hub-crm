import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { applyCurrencyMask, parseCurrency, formatCurrency } from '@/utils/currency';
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';
import { applyDocumentMask, cleanDocument, validateDocument } from '@/utils/document';
import { 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Building,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface Cliente {
  id: string;
  cpfCnpj: string;
  nome: string;
  empresa?: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  telefone: string;
  email: string;
  servicoContratado: 'Pacote 1' | 'Pacote 2' | 'Pacote 3';
  contrato: {
    prazo: string;
    valor: number;
    observacoes: string;
    dataInicio: string;
    dataVencimento: string;
  };
  status: 'Ativo' | 'Vencido' | 'Pendente';
}

const Financeiro: React.FC = () => {
  const { toast } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      cpfCnpj: '12.345.678/0001-90',
      nome: 'João Silva',
      empresa: 'Silva & Associados',
      endereco: {
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      telefone: '(11) 99999-9999',
      email: 'joao@silva.com',
      servicoContratado: 'Pacote 2',
      contrato: {
        prazo: '12 meses',
        valor: 2500,
        observacoes: 'Cliente premium com desconto especial',
        dataInicio: '2024-01-15',
        dataVencimento: '2025-01-15'
      },
      status: 'Ativo'
    }
  ]);

  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const [novoCliente, setNovoCliente] = useState<Omit<Cliente, 'id' | 'status'>>({
    cpfCnpj: '',
    nome: '',
    empresa: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    telefone: '',
    email: '',
    servicoContratado: 'Pacote 1',
    contrato: {
      prazo: '',
      valor: 0,
      observacoes: '',
      dataInicio: '',
      dataVencimento: ''
    }
  });

  const [valorContrato, setValorContrato] = useState('');
  const [telefoneDisplay, setTelefoneDisplay] = useState('');
  const [documentoDisplay, setDocumentoDisplay] = useState('');

  const calcularStatus = (dataVencimento: string): 'Ativo' | 'Vencido' | 'Pendente' => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasParaVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 3600 * 24));
    
    if (diasParaVencimento < 0) return 'Vencido';
    if (diasParaVencimento <= 30) return 'Pendente';
    return 'Ativo';
  };

  const salvarCliente = () => {
    if (!novoCliente.nome || !novoCliente.cpfCnpj || !novoCliente.email) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }
    
    if (!validateEmail(novoCliente.email)) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um email válido',
        variant: 'destructive'
      });
      return;
    }
    
    if (!validateDocument(novoCliente.cpfCnpj)) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um CPF ou CNPJ válido',
        variant: 'destructive'
      });
      return;
    }

    const status = calcularStatus(novoCliente.contrato.dataVencimento);
    
    if (clienteEditando) {
      setClientes(prev => prev.map(cliente => 
        cliente.id === clienteEditando.id 
          ? { ...novoCliente, id: clienteEditando.id, status }
          : cliente
      ));
      toast({
        title: 'Sucesso',
        description: 'Cliente atualizado com sucesso!'
      });
    } else {
      const novoId = Date.now().toString();
      setClientes(prev => [...prev, { ...novoCliente, id: novoId, status }]);
      toast({
        title: 'Sucesso',
        description: 'Cliente cadastrado com sucesso!'
      });
    }
    
    resetarFormulario();
  };

  const resetarFormulario = () => {
    setNovoCliente({
      cpfCnpj: '',
      nome: '',
      empresa: '',
      endereco: {
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      telefone: '',
      email: '',
      servicoContratado: 'Pacote 1',
      contrato: {
        prazo: '',
        valor: 0,
        observacoes: '',
        dataInicio: '',
        dataVencimento: ''
      }
    });
    setClienteEditando(null);
    setDialogAberto(false);
    setTelefoneDisplay('');
    setValorContrato('');
    setDocumentoDisplay('');
  };

  const editarCliente = (cliente: Cliente) => {
    setClienteEditando(cliente);
    setNovoCliente({
      cpfCnpj: cliente.cpfCnpj,
      nome: cliente.nome,
      empresa: cliente.empresa || '',
      endereco: cliente.endereco,
      telefone: cliente.telefone,
      email: cliente.email,
      servicoContratado: cliente.servicoContratado,
      contrato: cliente.contrato
    });
    setTelefoneDisplay(applyPhoneMask(cliente.telefone));
    setValorContrato(formatCurrency(cliente.contrato.valor));
    setDocumentoDisplay(applyDocumentMask(cliente.cpfCnpj));
    setDialogAberto(true);
  };

  const excluirCliente = (id: string) => {
    setClientes(prev => prev.filter(cliente => cliente.id !== id));
    toast({
      title: 'Sucesso',
      description: 'Cliente excluído com sucesso!'
    });
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const matchBusca = cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      cliente.cpfCnpj.includes(busca) ||
                      cliente.email.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === 'todos' || cliente.status.toLowerCase() === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const contratosVencendo = clientes.filter(cliente => cliente.status === 'Pendente').length;
  const contratosVencidos = clientes.filter(cliente => cliente.status === 'Vencido').length;
  const receitaTotal = clientes.reduce((total, cliente) => total + cliente.contrato.valor, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Módulo Financeiro</h1>
        <p className="text-muted-foreground mt-1">Gestão completa de clientes e contratos</p>
        </div>
        
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogTrigger asChild>
            <Button onClick={() => resetarFormulario()} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {clienteEditando ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do cliente e contrato
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <Tabs defaultValue="dados-pessoais" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="endereco">Endereço</TabsTrigger>
                  <TabsTrigger value="contrato">Contrato</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados-pessoais" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                      <Input
                      id="cpfCnpj"
                      value={documentoDisplay}
                      onChange={(e) => {
                        const maskedValue = applyDocumentMask(e.target.value)
                        const cleanValue = cleanDocument(e.target.value)
                        setDocumentoDisplay(maskedValue)
                        setNovoCliente(prev => ({ ...prev, cpfCnpj: cleanValue }))
                      }}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    />
                    </div>
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={novoCliente.nome}
                        onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome do cliente"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input
                      id="empresa"
                      value={novoCliente.empresa}
                      onChange={(e) => setNovoCliente(prev => ({ ...prev, empresa: e.target.value }))}
                      placeholder="Nome da empresa (opcional)"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={telefoneDisplay}
                        onChange={(e) => {
                          const masked = applyPhoneMask(e.target.value);
                          setTelefoneDisplay(masked);
                          setNovoCliente(prev => ({ ...prev, telefone: cleanPhone(masked) }));
                        }}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={novoCliente.email}
                        onChange={(e) => setNovoCliente(prev => ({ ...prev, email: normalizeEmail(e.target.value) }))}
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="endereco" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="rua">Rua/Avenida</Label>
                      <Input
                        id="rua"
                        value={novoCliente.endereco.rua}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, rua: e.target.value }
                        }))}
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero">Número</Label>
                      <Input
                        id="numero"
                        value={novoCliente.endereco.numero}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, numero: e.target.value }
                        }))}
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        value={novoCliente.endereco.bairro}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, bairro: e.target.value }
                        }))}
                        placeholder="Nome do bairro"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={novoCliente.endereco.cep}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, cep: e.target.value }
                        }))}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={novoCliente.endereco.cidade}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, cidade: e.target.value }
                        }))}
                        placeholder="Nome da cidade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={novoCliente.endereco.estado}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          endereco: { ...prev.endereco, estado: e.target.value }
                        }))}
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="contrato" className="space-y-4">
                  <div>
                    <Label htmlFor="servicoContratado">Serviço Contratado</Label>
                    <Select
                      value={novoCliente.servicoContratado}
                      onValueChange={(value: 'Pacote 1' | 'Pacote 2' | 'Pacote 3') => 
                        setNovoCliente(prev => ({ ...prev, servicoContratado: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pacote 1">Pacote 1 - Básico</SelectItem>
                        <SelectItem value="Pacote 2">Pacote 2 - Intermediário</SelectItem>
                        <SelectItem value="Pacote 3">Pacote 3 - Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prazo">Prazo do Contrato</Label>
                      <Input
                        id="prazo"
                        value={novoCliente.contrato.prazo}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          contrato: { ...prev.contrato, prazo: e.target.value }
                        }))}
                        placeholder="12 meses"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor">Valor do Contrato (R$)</Label>
                      <Input
                        id="valor"
                        type="text"
                        value={valorContrato}
                        onChange={(e) => {
                          const masked = applyCurrencyMask(e.target.value);
                          setValorContrato(masked);
                          const numericValue = parseCurrency(masked);
                          setNovoCliente(prev => ({
                            ...prev,
                            contrato: { ...prev.contrato, valor: numericValue }
                          }));
                        }}
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={novoCliente.contrato.dataInicio}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          contrato: { ...prev.contrato, dataInicio: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                      <Input
                        id="dataVencimento"
                        type="date"
                        value={novoCliente.contrato.dataVencimento}
                        onChange={(e) => setNovoCliente(prev => ({
                          ...prev,
                          contrato: { ...prev.contrato, dataVencimento: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={novoCliente.contrato.observacoes}
                      onChange={(e) => setNovoCliente(prev => ({
                        ...prev,
                        contrato: { ...prev.contrato, observacoes: e.target.value }
                      }))}
                      placeholder="Observações sobre o contrato..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetarFormulario}>
                  Cancelar
                </Button>
                <Button onClick={salvarCliente} className="bg-primary hover:bg-primary/90">
                  {clienteEditando ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{contratosVencendo}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{contratosVencidos}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(receitaTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Gerencie todos os seus clientes e contratos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF/CNPJ ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cliente.nome}</div>
                        {cliente.empresa && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Building className="w-3 h-3 mr-1" />
                            {cliente.empresa}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{cliente.cpfCnpj}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1" />
                          {cliente.telefone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {cliente.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{cliente.servicoContratado}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(cliente.contrato.valor)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(cliente.contrato.dataVencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(cliente.status)}>
                        {cliente.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editarCliente(cliente)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirCliente(cliente.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {clientesFiltrados.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;