import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { FinancialProtectedRoute, AdminProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";
import Index from "./pages/Index";
import Projetos from "./pages/Projetos";
import FunilVendas from "./pages/FunilVendas";
import CRM from "./pages/CRM";
import Financeiro from "./pages/Financeiro";
import Configuracoes from "./pages/Configuracoes";
import GestaoUsuarios from "./pages/GestaoUsuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente interno que usa o contexto de autenticação
function AppContent() {
  const { isAuthenticated } = useAuth();



  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/funil" element={<FunilVendas />} />
              <Route path="/crm" element={<CRM />} />
              <Route 
                path="/financeiro" 
                element={
                  <FinancialProtectedRoute>
                    <Financeiro />
                  </FinancialProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <AdminProtectedRoute>
                    <Configuracoes />
                  </AdminProtectedRoute>
                } 
              />
              <Route 
                path="/gestao-usuarios" 
                element={
                  <AdminProtectedRoute>
                    <GestaoUsuarios />
                  </AdminProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
