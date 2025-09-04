import React from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireFinancialAccess?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [], 
  requireFinancialAccess = false,
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, hasPermission, canAccessFinancial } = useAuth();
  const navigate = useNavigate();

  // Se não está autenticado, não renderiza nada (será tratado pelo App.tsx)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Verificar permissões específicas
  const hasRequiredPermissions = requiredRoles.length === 0 || hasPermission(requiredRoles);
  const hasFinancialPermission = !requireFinancialAccess || canAccessFinancial();

  // Se não tem permissão, mostrar mensagem de acesso negado
  if (!hasRequiredPermissions || !hasFinancialPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold">Acesso Negado</h3>
                  <p className="text-sm mt-1">
                    Você não tem permissão para acessar esta área do sistema.
                  </p>
                </div>
                
                <div className="text-xs space-y-1">
                  <p><strong>Seu nível:</strong> {user.role}</p>
                  {requiredRoles.length > 0 && (
                    <p><strong>Níveis necessários:</strong> {requiredRoles.join(', ')}</p>
                  )}
                  {requireFinancialAccess && (
                    <p><strong>Acesso financeiro:</strong> Necessário (ADM ou GESTOR)</p>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Se tem permissão, renderizar o conteúdo
  return <>{children}</>;
}

// Componente específico para proteger o módulo financeiro
export function FinancialProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['ADMIN', 'MANAGER']} 
      requireFinancialAccess={true}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente para proteger áreas administrativas
export function AdminProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['ADMIN']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}

// Componente para proteger áreas de gestão
export function ManagerProtectedRoute({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <ProtectedRoute 
      requiredRoles={['ADMIN', 'MANAGER']} 
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
}