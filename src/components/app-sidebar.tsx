import { useState, useEffect } from "react"
import { 
  BarChart3, 
  Kanban, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Settings,
  Home,
  Bell,
  Search,
  Zap,
  Activity,
  Shield
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth, usePermissions } from "@/contexts/AuthContext"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const allMainItems = [
  { title: "Dashboard", url: "/", icon: Home, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { title: "Projetos", url: "/projetos", icon: Kanban, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { title: "Funil de Vendas", url: "/funil", icon: TrendingUp, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { title: "CRM", url: "/crm", icon: Users, roles: ['ADMIN', 'MANAGER', 'USER'] },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign, roles: ['ADMIN', 'MANAGER'] },
]

const allSystemItems = [
  { title: "Configurações", url: "/configuracoes", icon: Settings, roles: ['ADMIN'] },
  { title: "Notificações", url: "/notificacoes", icon: Bell, roles: ['ADMIN', 'MANAGER', 'USER'] },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  
  const { user } = useAuth()
  const { hasPermission } = usePermissions()
  
  // Filtrar itens baseado nas permissões do usuário
  const mainItems = allMainItems // Temporariamente sem filtro
  const systemItems = allSystemItems // Temporariamente sem filtro

  // Debug logs
  console.log('User:', user)
  console.log('User role:', user?.role)
  console.log('Main items:', mainItems)
  console.log('System items:', systemItems)
  console.log('hasPermission test:', hasPermission(['ADMIN']))
  console.log('hasPermission test USER:', hasPermission(['USER']))
  console.log('hasPermission test MANAGER:', hasPermission(['MANAGER']))

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseAnimation(true)
      setTimeout(() => setPulseAnimation(false), 2000)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (path: string) => currentPath === path

  const getNavClasses = ({ isActive }: { isActive: boolean }) => {
    const baseClasses = "group relative overflow-hidden rounded-xl transition-all duration-300 ease-out transform"
    
    if (isActive) {
      return `${baseClasses} bg-gradient-coffee text-white font-semibold shadow-2xl shadow-primary/25 scale-105 border border-primary/30`
    }
    
    return `${baseClasses} bg-gradient-to-r from-slate-800/50 to-slate-700/30 text-slate-300 hover:from-slate-700/70 hover:to-slate-600/50 hover:text-white hover:scale-102 hover:shadow-lg hover:shadow-slate-500/20 border border-slate-600/20 hover:border-slate-500/40 backdrop-blur-sm`
  }

  const getLedEffect = (isActive: boolean, isHovered: boolean) => {
    if (isActive) {
      return "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:animate-shimmer"
    }
    if (isHovered) {
      return "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-blue-400/10 before:to-transparent before:translate-x-[-100%] before:animate-shimmer"
    }
    return ""
  }

  return (
    <Sidebar
      className="border-r border-slate-700/30 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl"
      collapsible="icon"
    >
      <SidebarContent className="px-4 py-6 relative">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10 animate-pulse" />
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-secondary/5 rounded-full blur-xl animate-float-delayed" />
        </div>

        {/* Logo Section */}
        <div className="relative flex items-center justify-center mb-10">
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 group">
              <div className={`relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${pulseAnimation ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity" />
                <BarChart3 className="relative w-7 h-7 text-white drop-shadow-lg" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent font-poppins tracking-tight">
                  SparkBoard
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  <Shield className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-400 font-medium">{user?.role}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3 ${pulseAnimation ? 'animate-pulse' : ''}`}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl blur opacity-75 hover:opacity-100 transition-opacity" />
              <BarChart3 className="relative w-7 h-7 text-white drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="relative mb-8">
          {!isCollapsed && (
            <SidebarGroupLabel className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest mb-4 px-2">
              <Zap className="w-4 h-4 text-secondary" />
              <span>Principal</span>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {mainItems.map((item, index) => {
                const itemIsActive = isActive(item.url)
                const itemIsHovered = hoveredItem === item.title
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className="p-0 h-auto"
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <NavLink 
                        to={item.url} 
                        end 
                        className={`${getNavClasses({ isActive: itemIsActive })} ${getLedEffect(itemIsActive, itemIsHovered)} flex items-center p-3 min-h-[48px] relative group`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Icon with glow effect */}
                        <div className={`relative ${isCollapsed ? "mx-auto" : "mr-4"}`}>
                          <item.icon className={`h-6 w-6 transition-all duration-300 ${itemIsActive ? 'text-white drop-shadow-lg' : 'text-slate-300 group-hover:text-white'} ${itemIsActive ? 'animate-pulse' : ''}`} />
                          {itemIsActive && (
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-ping" />
                          )}
                        </div>
                        
                        {/* Text with gradient */}
                        {!isCollapsed && (
                          <span className={`font-semibold tracking-wide transition-all duration-300 ${itemIsActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                            {item.title}
                          </span>
                        )}
                        
                        {/* Active indicator */}
                        {itemIsActive && (
                          <div className="absolute right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        
                        {/* Hover glow effect */}
                        {itemIsHovered && !itemIsActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup className="relative">
          {!isCollapsed && (
            <SidebarGroupLabel className="flex items-center space-x-2 text-slate-400 font-semibold text-sm uppercase tracking-widest mb-4 px-2">
              <Settings className="w-4 h-4 text-secondary" />
              <span>Sistema</span>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {systemItems.map((item, index) => {
                const itemIsActive = isActive(item.url)
                const itemIsHovered = hoveredItem === item.title
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className="p-0 h-auto"
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <NavLink 
                        to={item.url} 
                        className={`${getNavClasses({ isActive: itemIsActive })} ${getLedEffect(itemIsActive, itemIsHovered)} flex items-center p-3 min-h-[48px] relative group`}
                        style={{ animationDelay: `${(index + mainItems.length) * 100}ms` }}
                      >
                        {/* Icon with glow effect */}
                        <div className={`relative ${isCollapsed ? "mx-auto" : "mr-4"}`}>
                          <item.icon className={`h-6 w-6 transition-all duration-300 ${itemIsActive ? 'text-white drop-shadow-lg' : 'text-slate-300 group-hover:text-white'} ${itemIsActive ? 'animate-pulse' : ''}`} />
                          {itemIsActive && (
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-ping" />
                          )}
                        </div>
                        
                        {/* Text with gradient */}
                        {!isCollapsed && (
                          <span className={`font-semibold tracking-wide transition-all duration-300 ${itemIsActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                            {item.title}
                          </span>
                        )}
                        
                        {/* Active indicator */}
                        {itemIsActive && (
                          <div className="absolute right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        
                        {/* Hover glow effect */}
                        {itemIsHovered && !itemIsActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl animate-pulse" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer with status indicator */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/60 rounded-xl p-3 border border-slate-600/30 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-300 font-medium">Sistema Online</span>
                </div>
                <div className="text-xs text-slate-400">v2.0</div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}