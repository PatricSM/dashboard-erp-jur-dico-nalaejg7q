import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, Search, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { differenceInDays, parseISO, startOfDay } from 'date-fns'
import { ContractSheet } from '@/components/ContractSheet'
import { StatusChip } from '@/components/StatusChip'
import pb from '@/lib/pocketbase/client'

export default function Contratos() {
  const [data, setData] = useState<any>({ items: [], totalPages: 1 })
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedContract, setSelectedContract] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    pb.collection('clients').getFullList({ sort: 'name' }).then(setClients).catch(console.error)
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const filters = []
      if (statusFilter !== 'all') filters.push(`status='${statusFilter}'`)
      if (clientFilter !== 'all') filters.push(`client_id='${clientFilter}'`)
      if (debouncedSearch)
        filters.push(`(title~'${debouncedSearch}' || expand.client_id.name~'${debouncedSearch}')`)

      const res = await pb.collection('contracts').getList(page, 10, {
        sort: '-created',
        expand: 'client_id',
        filter: filters.join(' && '),
      })
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [page, statusFilter, clientFilter, typeFilter, debouncedSearch])

  useRealtime('contracts', loadData)

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)

  const fmtDate = (str: string) => {
    if (!str) return '-'
    return new Date(str).toLocaleDateString('pt-BR')
  }

  const getDerivedStatus = (c: any) => {
    if (!c) return 'inactive'
    const dateStr = c.vigencia_fim || c.expiry_date
    if (c.status !== 'active' || !dateStr) return c.status
    const days = differenceInDays(parseISO(dateStr), startOfDay(new Date()))
    if (days >= 0 && days <= 30) return 'expiring'
    return c.status
  }

  const renderPagination = () => {
    const pages = []
    for (let i = 1; i <= data.totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant="outline"
          className={`w-9 h-9 p-0 rounded-lg ${page === i ? 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/90 hover:text-white' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </Button>,
      )
    }
    return (
      <div className="flex items-center justify-end gap-2 mt-6">
        <Button
          variant="outline"
          className="w-9 h-9 p-0 rounded-lg"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {pages}
        <Button
          variant="outline"
          className="w-9 h-9 p-0 rounded-lg"
          disabled={page === data.totalPages || data.totalPages === 0}
          onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Contratos
        </h1>
        <Button className="bg-secondary hover:bg-secondary/90 text-white w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Novo contrato
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar contratos..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="expired">Vencido</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="prestacao">Prestação de Serviço</SelectItem>
              <SelectItem value="locacao">Locação</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={clientFilter}
            onValueChange={(v) => {
              setClientFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-md overflow-hidden h-10">
            <Button
              variant="ghost"
              className={`h-full rounded-none px-3 border-0 ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className={`h-full rounded-none px-3 border-0 border-l ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        viewMode === 'list' ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : viewMode === 'list' ? (
        <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="pl-6">Cliente</TableHead>
                <TableHead>Título / Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="pr-6 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((c: any) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => setSelectedContract(c)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={pb.files.getUrl(c.expand?.client_id, c.expand?.client_id?.avatar)}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {c.expand?.client_id?.name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {c.expand?.client_id?.name || 'Sem Cliente'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{c.title}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 font-medium tabular-nums">
                    {fmtCurrency(c.value)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {fmtDate(c.vigencia_fim || c.expiry_date)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <StatusChip status={getDerivedStatus(c)} />
                  </TableCell>
                </TableRow>
              ))}
              {data.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Nenhum contrato encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((c: any) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:shadow-md transition-shadow dark:bg-slate-900"
              onClick={() => setSelectedContract(c)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={pb.files.getUrl(c.expand?.client_id, c.expand?.client_id?.avatar)}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {c.expand?.client_id?.name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {c.expand?.client_id?.name || 'Sem Cliente'}
                      </CardTitle>
                      <p className="text-sm text-slate-500 line-clamp-1">{c.title}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Valor (Mensal)</p>
                    <p className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {fmtCurrency(c.value)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-xs text-slate-500">Vencimento</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {fmtDate(c.vigencia_fim || c.expiry_date)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <StatusChip status={getDerivedStatus(c)} />
                </div>
              </CardContent>
            </Card>
          ))}
          {data.items.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-900 rounded-xl border">
              Nenhum contrato encontrado.
            </div>
          )}
        </div>
      )}

      {!isLoading && data.totalPages > 1 && renderPagination()}

      <ContractSheet
        contract={selectedContract}
        open={!!selectedContract}
        onOpenChange={(val: boolean) => !val && setSelectedContract(null)}
      />
    </div>
  )
}
