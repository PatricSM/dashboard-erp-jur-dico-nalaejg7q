import { Badge } from '@/components/ui/badge'

export function StatusChip({ status }: { status: string }) {
  if (status === 'active') {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">Ativo</Badge>
    )
  }
  return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-0">Inativo</Badge>
}
