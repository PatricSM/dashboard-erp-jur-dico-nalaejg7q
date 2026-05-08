import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Users, Briefcase, FileText, ClipboardList, LogOut } from 'lucide-react'
import { OSModal } from './OSModal'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Fornecedores', url: '/fornecedores', icon: Briefcase },
  { title: 'Contratos', url: '/contratos', icon: FileText },
  { title: 'Ordens de Serviço', url: '/ordens-de-servico', icon: ClipboardList },
]

export default function Layout() {
  const { signOut } = useAuth()
  const location = useLocation()

  return (
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-500">
            <Briefcase className="h-6 w-6" />
            <span>ERP Jurídico</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url} className="text-[15px]">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-white dark:bg-slate-900 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="hidden sm:block text-sm text-slate-500 capitalize font-medium">
              {location.pathname === '/'
                ? 'Dashboard'
                : location.pathname.slice(1).replace(/-/g, ' ')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <OSModal />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 bg-slate-50 dark:bg-zinc-950 overflow-auto relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
