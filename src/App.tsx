import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from './components/Layout'
import Login from './pages/Login'
import Index from './pages/Index'
import Clientes from './pages/Clientes'
import Fornecedores from './pages/Fornecedores'
import Contratos from './pages/Contratos'
import Agenda from './pages/Agenda'
import OrdensDeServico from './pages/OrdensDeServico'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }: { children: any }) => {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        Carregando...
      </div>
    )
  if (!user) return <Navigate to="/login" />
  return children
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Index />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/fornecedores" element={<Fornecedores />} />
      <Route path="/contratos" element={<Contratos />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="/ordens-de-servico" element={<OrdensDeServico />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
)

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
