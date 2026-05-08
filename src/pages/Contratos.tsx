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
import { Plus, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import { ContractSheet } from '@/components/ContractSheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Contratos() {
  const [contracts, setContracts] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [selectedContract, setSelectedContract] = useState<any>(null)
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

  const fmtDate = (str: string) => {
    if (!str) return '-'
    return new Date(str).toLocaleDateString('pt-BR')
  }

  const today = startOfDay(new Date())

  const getExpiryColor = (dateStr: string, status: string) => {
    if (!dateStr || status === 'cancelled' || status === 'expired') return 'text-slate-500'
    const days = differenceInDays(parseISO(dateStr), today)
    if (days <= 14) return 'text-red-600 font-bold dark:text-red-400'
    if (days <= 30) return 'text-orange-500 font-bold dark:text-orange-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const filtered = contracts.filter((c) => {
    if (filter === 'active') return c.status === 'active'
    if (filter === 'expired') return c.status === 'expired' || c.status === 'cancelled'
    if (filter === 'expiring') {
      if (c.status !== 'active' || !c.vigencia_fim) return false
      const days = differenceInDays(parseISO(c.vigencia_fim), today)
      return days >= 0 && days <= 30
    }
    return true
  })

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900">
              <Filter className="w-4 h-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Contratos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="expiring">Vencendo (30 dias)</SelectItem>
              <SelectItem value="expired">Encerrados / Vencidos</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Contrato
          </Button>
        </div>
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
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                onClick={() => setSelectedContract(c)}
              >
                <TableCell className="pl-6 font-medium">{c.title}</TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400">
                  {c.expand?.client_id?.name || '-'}
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                  {fmtCurrency(c.value)}
                </TableCell>
                <TableCell className={getExpiryColor(c.vigencia_fim || c.expiry_date, c.status)}>
                  {fmtDate(c.vigencia_fim || c.expiry_date)}
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum contrato encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ContractSheet
        contract={selectedContract}
        open={!!selectedContract}
        onOpenChange={(val: boolean) => !val && setSelectedContract(null)}
      />
    </div>
  )
}
