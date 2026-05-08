import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CalendarDays,
  ClipboardList,
  Scale,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const NAV_ITEMS = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes', icon: Users },
  { title: 'Fornecedores', url: '/fornecedores', icon: Briefcase },
  { title: 'Contratos', url: '/contratos', icon: FileText },
  { title: 'Agenda', url: '/agenda', icon: CalendarDays },
  { title: 'Ordens de Serviço', url: '/ordens-de-servico', icon: ClipboardList },
]

export function AppSidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const avatarUrl = user?.avatar
    ? `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${user?.collectionId}/${user?.id}/${user?.avatar}`
    : undefined

  return (
    <aside className="w-20 h-full bg-primary flex flex-col items-center py-6 shrink-0 z-20 relative">
      <div className="flex flex-col items-center justify-center gap-2 mb-10">
        <div className="w-12 h-12 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center shadow-sm">
          <Scale className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-primary-foreground tracking-wider uppercase">
          ERP
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.url
          return (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <Link
                  to={item.url}
                  className={cn(
                    'w-14 h-14 rounded-lg flex items-center justify-center mx-auto transition-all',
                    isActive
                      ? 'bg-secondary text-secondary-foreground shadow-md'
                      : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="font-medium bg-popover text-popover-foreground border-border"
              >
                {item.title}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </nav>

      <div className="mt-auto px-3 w-full flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={signOut}
              className="w-12 h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary transition-all hover:ring-2 hover:ring-secondary/50 flex items-center justify-center"
            >
              <Avatar className="w-full h-full border-2 border-primary-foreground/20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() ||
                    user?.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="font-medium bg-popover text-popover-foreground border-border"
          >
            {user?.name || user?.email || 'Usuário'} (Sair)
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}
