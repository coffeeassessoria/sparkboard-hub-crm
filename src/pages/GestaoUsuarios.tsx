import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { mockUsersAPI, CreateUserRequest } from '@/services/mockApi';
import { User, UserRole, Department, OperationalRole, CommercialRole, FinancialRole, AdministrativeRole } from '@/types';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Search,
  Filter
} from 'lucide-react';

const GestaoUsuarios = () => {
  const { user, canCreateUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    role: UserRole.USER,
    department: undefined,
    specificRole: undefined,
    permissions: [],
    isActive: true
  });

  // Verificar se o usuário tem permissão para acessar esta página
  if (!canCreateUsers()) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você não tem permissão para acessar a gestão de usuários.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await mockUsersAPI.getAll();
      setUsers(usersData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      await mockUsersAPI.create(formData, user.id);
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso"
      });
      setShowCreateForm(false);
      resetForm();
      loadUsers();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar usuário",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await mockUsersAPI.toggleActive(userId);
      toast({
        title: "Sucesso",
        description: "Status do usuário atualizado"
      });
      loadUsers();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do usuário",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await mockUsersAPI.delete(userId);
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso"
        });
        loadUsers();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir usuário",
          variant: "destructive"
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: UserRole.USER,
      department: undefined,
      specificRole: undefined,
      permissions: [],
      isActive: true
    });
    setEditingUser(null);
  };

  const getSpecificRoleOptions = () => {
    switch (formData.department) {
      case Department.OPERACIONAL:
        return Object.values(OperationalRole).map(role => ({ value: role, label: role }));
      case Department.COMERCIAL:
        return Object.values(CommercialRole).map(role => ({ value: role, label: role }));
      case Department.FINANCEIRO:
        return Object.values(FinancialRole).map(role => ({ value: role, label: role }));
      case Department.ADMINISTRATIVO:
        return Object.values(AdministrativeRole).map(role => ({ value: role, label: role }));
      default:
        return [];
    }
  };

  const getDefaultPermissions = () => {
    const basePermissions = ['view_dashboard'];
    
    switch (formData.department) {
      case Department.OPERACIONAL:
        return [...basePermissions, 'view_projects', 'edit_designs'];
      case Department.COMERCIAL:
        return [...basePermissions, 'view_leads', 'create_leads', 'edit_leads'];
      case Department.FINANCEIRO:
        return [...basePermissions, 'view_financial', 'manage_invoices'];
      case Department.ADMINISTRATIVO:
        return [...basePermissions, 'manage_settings', 'view_reports'];
      default:
        return basePermissions;
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || u.department === filterDepartment;
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    
    return matchesSearch && matchesDepartment && matchesRole;
  });

  const getDepartmentBadgeColor = (department?: Department) => {
    switch (department) {
      case Department.OPERACIONAL: return 'bg-blue-100 text-blue-800';
      case Department.COMERCIAL: return 'bg-green-100 text-green-800';
      case Department.FINANCEIRO: return 'bg-yellow-100 text-yellow-800';
      case Department.ADMINISTRATIVO: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'bg-red-100 text-red-800';
      case UserRole.MANAGER: return 'bg-orange-100 text-orange-800';
      case UserRole.USER: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, roles e permissões do sistema
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(Department).map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.values(UserRole).map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {filteredUsers.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{u.name}</h3>
                      {!u.isActive && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{u.email}</p>
                    <div className="flex gap-2">
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {u.role}
                      </Badge>
                      {u.department && (
                        <Badge className={getDepartmentBadgeColor(u.department)}>
                          {u.department}
                        </Badge>
                      )}
                      {u.specificRole && (
                        <Badge variant="outline">
                          {u.specificRole}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(u.id)}
                    className="flex items-center gap-1"
                  >
                    {u.isActive ? (
                      <>
                        <UserX className="h-4 w-4" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Ativar
                      </>
                    )}
                  </Button>
                  {u.id !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteUser(u.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Usuário</CardTitle>
            <CardDescription>
              Preencha os dados do novo usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(UserRole).map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select
                    value={formData.department || ''}
                    onValueChange={(value: Department) => {
                      setFormData({ 
                        ...formData, 
                        department: value,
                        specificRole: undefined,
                        permissions: getDefaultPermissions()
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Department).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.department && (
                  <div className="space-y-2">
                    <Label htmlFor="specificRole">Cargo Específico</Label>
                    <Select
                      value={formData.specificRole || ''}
                      onValueChange={(value) => setFormData({ ...formData, specificRole: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSpecificRoleOptions().map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Usuário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GestaoUsuarios;