import { useEffect, useState } from 'react'
import { getServiceOrders } from '@/services/service_orders'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useRealtime } from '@/hooks/use-realtime'

export default function OrdensDeServico() {
  const [orders, setOrders] = useState<any[]>([])
  const load = () => getServiceOrders().then(setOrders)
  useEffect(() => {
    load()
  }, [])
  useRealtime('service_orders', load)

  const statusMap: Record<string, { label: string; color: string }> = {
    open: { label: 'Em Aberto', color: 'bg-blue-100 text-blue-800' },
    in_progress: { label: 'Em Andamento', color: 'bg-amber-100 text-amber-800' },
    completed: { label: 'Concluída', color: 'bg-emerald-100 text-emerald-800' },
  }

  const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: 'Baixa', color: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Média', color: 'bg-indigo-100 text-indigo-700' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-700' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Ordens de Serviço
        </h1>
      </div>
      <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="pl-6">Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="pl-6 font-medium">{o.title}</TableCell>
                <TableCell className="text-slate-600">{o.expand?.client_id?.name || '-'}</TableCell>
                <TableCell className="text-slate-600">
                  {o.expand?.contrato_id?.title || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${priorityMap[o.priority]?.color || 'bg-slate-100'} border-0 shadow-none`}
                  >
                    {priorityMap[o.priority]?.label || o.priority}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusMap[o.status]?.color || 'bg-slate-100'}`}
                  >
                    {statusMap[o.status]?.label || o.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhuma ordem de serviço encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
