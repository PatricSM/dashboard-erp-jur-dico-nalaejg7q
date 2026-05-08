import { useEffect, useState } from 'react'
import { getContracts } from '@/services/contracts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Contratos() {
  const [contracts, setContracts] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => getContracts().then(setContracts)
  useEffect(() => {
    load()
  }, [])
  useRealtime('contracts', load)

  const handleAdd = () =>
    toast({ title: 'Aviso', description: 'Funcionalidade em desenvolvimento.' })

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  const fmtDate = (str: string) => new Date(str).toLocaleDateString('pt-BR')

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-800' },
    expired: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelado', color: 'bg-slate-100 text-slate-800' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Contratos
        </h1>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Contrato
        </Button>
      </div>
      <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="pl-6">Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-6 font-medium">{c.title}</TableCell>
                <TableCell className="text-slate-600">{c.expand?.client_id?.name || '-'}</TableCell>
                <TableCell className="text-slate-600 font-medium">{fmtCurrency(c.value)}</TableCell>
                <TableCell className="text-slate-500">
                  {c.vigencia_fim
                    ? fmtDate(c.vigencia_fim)
                    : c.expiry_date
                      ? fmtDate(c.expiry_date)
                      : '-'}
                </TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge
                    className={`${statusMap[c.status]?.color || 'bg-slate-100'} border-0 hover:opacity-90`}
                  >
                    {statusMap[c.status]?.label || c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {contracts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum contrato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
