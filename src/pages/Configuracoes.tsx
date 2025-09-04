import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { applyPhoneMask, cleanPhone } from '@/utils/phone';
import { validateEmail, normalizeEmail } from '@/utils/email';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

const Configuracoes = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true,
    marketing: false
  });
  const [profile, setProfile] = useState({
    name: 'Usuário Admin',
    email: 'admin@sparkboard.com',
    company: 'SparkBoard Hub',
    phone: '+55 11 99999-9999',
    bio: 'Administrador do sistema SparkBoard Hub'
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    passwordExpiry: '90'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = (section: string) => {
    if (section === 'perfil') {
      if (!profile.name || !profile.email) {
        toast({
          title: "Erro",
          description: "Nome e email são obrigatórios",
          variant: "destructive",
        });
        return;
      }
      
      if (!validateEmail(profile.email)) {
        toast({
          title: "Erro",
          description: "Por favor, insira um email válido",
          variant: "destructive",
        });
        return;
      }
    }
    
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${section} foram atualizadas com sucesso.`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportação iniciada",
      description: "Suas configurações estão sendo exportadas...",
    });
  };

  const handleImport = () => {
    toast({
      title: "Importação concluída",
      description: "Configurações importadas com sucesso.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas para o padrão.",
      variant: "destructive"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="destructive" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e de contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: normalizeEmail(e.target.value)})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    value={profile.company}
                    onChange={(e) => setProfile({...profile, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => {
                      const maskedPhone = applyPhoneMask(e.target.value);
                      setProfile({...profile, phone: maskedPhone});
                    }}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={3}
                />
              </div>
              <Button onClick={() => handleSave('perfil')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aparência */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Tema e Aparência
              </CardTitle>
              <CardDescription>
                Personalize a aparência da interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar tema escuro para reduzir o cansaço visual
                    </p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Esquema de Cores</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                      <Sun className="w-4 h-4" />
                      <span className="text-sm">Claro</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                      <Moon className="w-4 h-4" />
                      <span className="text-sm">Escuro</span>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                      <Monitor className="w-4 h-4" />
                      <span className="text-sm">Sistema</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Tamanho da Fonte</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequena</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => handleSave('aparência')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, email: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, push: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Notificações Desktop</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações na área de trabalho
                    </p>
                  </div>
                  <Switch
                    checked={notifications.desktop}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, desktop: checked})
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Marketing e Promoções</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber informações sobre novidades e promoções
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, marketing: checked})
                    }
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('notificações')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Autenticação de Dois Fatores</Label>
                    <p className="text-sm text-muted-foreground">
                      Adicione uma camada extra de segurança
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={security.twoFactor ? "default" : "secondary"}>
                      {security.twoFactor ? "Ativo" : "Inativo"}
                    </Badge>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => 
                        setSecurity({...security, twoFactor: checked})
                      }
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Alterar Senha</Label>
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Input type="password" placeholder="Nova senha" />
                    <Input type="password" placeholder="Confirmar nova senha" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout da Sessão (minutos)</Label>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(value) => 
                        setSecurity({...security, sessionTimeout: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiração da Senha (dias)</Label>
                    <Select
                      value={security.passwordExpiry}
                      onValueChange={(value) => 
                        setSecurity({...security, passwordExpiry: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 dias</SelectItem>
                        <SelectItem value="60">60 dias</SelectItem>
                        <SelectItem value="90">90 dias</SelectItem>
                        <SelectItem value="never">Nunca</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave('segurança')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações avançadas e informações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Informações do Sistema
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Versão:</span>
                      <Badge variant="outline">v2.1.0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última Atualização:</span>
                      <span>15/01/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span>99.9%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Ações do Sistema</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Logs do Sistema
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Limpar Cache
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Dados Temporários
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Configurações Avançadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Idioma do Sistema</Label>
                    <Select defaultValue="pt-br">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                        <SelectItem value="en-us">English (US)</SelectItem>
                        <SelectItem value="es-es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select defaultValue="america/sao_paulo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america/sao_paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="america/new_york">New York (GMT-5)</SelectItem>
                        <SelectItem value="europe/london">London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Button onClick={() => handleSave('sistema')}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuracoes;