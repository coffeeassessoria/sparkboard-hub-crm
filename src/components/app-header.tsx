import { Bell, Search, Settings, User, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

export function AppHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADM':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'GESTOR':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'OPERACIONAL':
        return 'bg-gradient-to-r from-green-500 to-green-600';
      default:
        return 'bg-gradient-sunset';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADM':
        return 'Administrador';
      case 'GESTOR':
        return 'Gestor';
      case 'OPERACIONAL':
        return 'Operacional';
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Side - Sidebar Trigger & Search */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-sidebar-foreground hover:text-sidebar-primary" />
          
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar projetos, clientes..."
              className="pl-10 bg-muted/50 border-0 focus:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover-scale">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hover-scale">
            <Settings className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-scale">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatars/01.png" alt={`@${user?.name}`} />
                  <AvatarFallback className={`${getRoleColor(user?.role || '')} text-white font-medium`}>
                    {getUserInitials(user?.name || 'User')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {getRoleLabel(user?.role || '')}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}