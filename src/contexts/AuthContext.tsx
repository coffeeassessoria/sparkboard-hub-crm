import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, UserRole, Department, SpecificRole } from '../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canAccessFinancial: () => boolean;
  canCreateUsers: () => boolean;
  canManageDepartment: (department: Department) => boolean;
  hasSpecificPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage
    const storedUser = localStorage.getItem('sparkboard_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error);
        localStorage.removeItem('sparkboard_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('sparkboard_user', JSON.stringify(response.user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sparkboard_user');
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user || !isAuthenticated) return false;
    return requiredRoles.includes(user.role);
  };

  const canAccessFinancial = (): boolean => {
    // Apenas ADMIN tem acesso ao módulo financeiro
    return hasPermission([UserRole.ADMIN]);
  };

  const canCreateUsers = (): boolean => {
    return hasPermission([UserRole.ADMIN]);
  };

  const canManageDepartment = (department: Department): boolean => {
    if (!user || !isAuthenticated) return false;
    if (user.role === UserRole.ADMIN) return true;
    return user.department === department && user.role === UserRole.MANAGER;
  };

  const hasSpecificPermission = (permission: string): boolean => {
    if (!user || !isAuthenticated) return false;
    if (user.role === UserRole.ADMIN) return true;
    return user.permissions?.includes(permission) || false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canAccessFinancial,
    canCreateUsers,
    canManageDepartment,
    hasSpecificPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

// Hook para verificar permissões específicas
export function usePermissions() {
  const { hasPermission, canAccessFinancial, canCreateUsers, canManageDepartment, hasSpecificPermission, user } = useAuth();
  
  return {
    hasPermission,
    canAccessFinancial,
    canCreateUsers,
    canManageDepartment,
    hasSpecificPermission,
    isAdmin: () => hasPermission([UserRole.ADMIN]),
    isManager: () => hasPermission([UserRole.MANAGER]),
    isUser: () => hasPermission([UserRole.USER]),
    canManageUsers: () => hasPermission([UserRole.ADMIN]),
    canManageProjects: () => hasPermission([UserRole.ADMIN, UserRole.MANAGER]),
    canViewReports: () => hasPermission([UserRole.ADMIN, UserRole.MANAGER]),
    canAccessOperational: () => user?.department === Department.OPERACIONAL || hasPermission([UserRole.ADMIN]),
    canAccessCommercial: () => user?.department === Department.COMERCIAL || hasPermission([UserRole.ADMIN]),
    canAccessAdministrative: () => user?.department === Department.ADMINISTRATIVO || hasPermission([UserRole.ADMIN]),
    isDesigner: () => user?.specificRole === 'DESIGNER',
    isVideoEditor: () => user?.specificRole === 'EDITOR_VIDEO',
    isProjectManager: () => user?.specificRole === 'GESTOR_PROJETOS',
    isSDR: () => user?.specificRole === 'SDR',
    isBDR: () => user?.specificRole === 'BDR',
    isCloser: () => user?.specificRole === 'CLOSER',
    isCommercialManager: () => user?.specificRole === 'GESTOR_COMERCIAL'
  };
}