import { Badge } from '@/components/ui/badge'

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
    expiring: { label: 'Vencendo', className: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    expired: { label: 'Vencido', className: 'bg-red-100 text-red-800 hover:bg-red-200' },
    cancelled: { label: 'Cancelado', className: 'bg-slate-100 text-slate-800 hover:bg-slate-200' },
  }

  const { label, className } = map[status] || {
    label: status || 'Inativo',
    className: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
  }

  return <Badge className={`${className} border-0`}>{label}</Badge>
}
