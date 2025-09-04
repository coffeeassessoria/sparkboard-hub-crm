import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { UserRole } from '../types';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canAccessFinancial: () => boolean;
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
    return hasPermission(['ADM', 'GESTOR']);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canAccessFinancial
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
  const { hasPermission, canAccessFinancial } = useAuth();
  
  return {
    hasPermission,
    canAccessFinancial,
    isAdmin: () => hasPermission(['ADM']),
    isManager: () => hasPermission(['GESTOR']),
    isOperational: () => hasPermission(['OPERACIONAL']),
    canManageUsers: () => hasPermission(['ADM']),
    canManageProjects: () => hasPermission(['ADM', 'GESTOR']),
    canViewReports: () => hasPermission(['ADM', 'GESTOR'])
  };
}