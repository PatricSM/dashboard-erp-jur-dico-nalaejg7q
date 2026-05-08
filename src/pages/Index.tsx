import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Plus,
  PackageOpen,
  FileClock,
  ClipboardList,
} from 'lucide-react'
import { format, subDays, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { StatusChip } from '@/components/StatusChip'
import { useRealtime } from '@/hooks/use-realtime'

import {
  getContractsCount,
  getContractsTotalValue,
  getExpiringContracts,
} from '@/services/contracts'
import { getClientsCount } from '@/services/clients'
import { getSuppliersCount } from '@/services/suppliers'
import { getRecentServiceOrders } from '@/services/service_orders'
import { getActivities } from '@/services/activities'

const mapStatusToTone = (status: string): any => {
  const s = (status || '').toLowerCase()
  if (['active', 'vigente'].includes(s)) return 'active'
  if (['expiring', 'vencendo'].includes(s)) return 'expiring'
  if (['expirado', 'closed', 'expired', 'cancelled', 'inactive'].includes(s)) return 'closed'
  if (['rascunho', 'draft'].includes(s)) return 'neutral'
  return 'info'
}

const mapStatusToLabel = (status: string) => {
  const map: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    expired: 'Expirado',
    cancelled: 'Cancelado',
    open: 'Aberto',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
  }
  return map[status] || status
}

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({ clients: 0, suppliers: 0, contracts: 0, revenue: 0 })
  const [expiringContracts, setExpiringContracts] = useState<any[]>([])
  const [recentOS, setRecentOS] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])

  const loadData = async () => {
    try {
      const [clients, suppliers, contracts, revenue, expiring, os, acts] = await Promise.all([
        getClientsCount("status='active'"),
        getSuppliersCount("status='active'"),
        getContractsCount("status='active' || (expiry_date != '' && expiry_date > @now)"),
        getContractsTotalValue(),
        getExpiringContracts(),
        getRecentServiceOrders(),
        getActivities(),
      ])

      setMetrics({ clients, suppliers, contracts, revenue })
      setExpiringContracts(expiring.items || [])
      setRecentOS(os.items || [])

      const days = Array.from({ length: 30 }).map((_, i) => subDays(new Date(), 29 - i))
      const data = days.map((day) => {
        const count = (acts.items || []).filter((a: any) =>
          isSameDay(parseISO(a.created), day),
        ).length
        return {
          date: format(day, 'dd/MMM', { locale: ptBR }),
          count,
        }
      })
      setChartData(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('clients', loadData)
  useRealtime('suppliers', loadData)
  useRealtime('contracts', loadData)
  useRealtime('service_orders', loadData)
  useRealtime('activities', loadData)

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const fmtDate = (str: string) => {
    if (!str) return '-'
    return format(parseISO(str), 'dd/MM/yyyy')
  }

  const relativeTime = (str: string) => {
    if (!str) return '-'
    const date = parseISO(str)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `Há ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Há ${diffInDays} ${diffInDays === 1 ? 'dia' : 'dias'}`
  }

  const chartConfig = {
    count: { label: 'Atividades', color: 'hsl(var(--primary))' },
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <PageHeader
        title="Dashboard"
        subtitle="Visão executiva do ERP"
        actions={
          <Button asChild>
            <Link to="/contratos?new=true">
              <Plus className="mr-2 h-4 w-4" /> Novo contrato
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.clients}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Fornecedores Ativos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.suppliers}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Contratos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {metrics.contracts}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Revenue Pipeline
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {fmtCurrency(metrics.revenue)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
            <CardTitle className="text-lg">Contratos próximos do vencimento</CardTitle>
            <CardDescription>Nos próximos 30 dias</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : expiringContracts.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {expiringContracts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
                        <FileClock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {c.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {c.expand?.client_id?.name || 'Sem cliente'} • {fmtDate(c.expiry_date)}
                        </p>
                      </div>
                    </div>
                    <StatusChip tone={mapStatusToTone('expiring')} label="Vencendo" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageOpen}
                title="Nada vencendo"
                description="Nenhum contrato possui vencimento para os próximos 30 dias."
              />
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
            <CardTitle className="text-lg">OS recentes</CardTitle>
            <CardDescription>Últimas 5 ordens de serviço</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentOS.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOS.map((os) => (
                  <div
                    key={os.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                        <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {os.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {os.expand?.client_id?.name || 'Sem cliente'} • {relativeTime(os.created)}
                        </p>
                      </div>
                    </div>
                    <StatusChip
                      tone={mapStatusToTone(os.status)}
                      label={mapStatusToLabel(os.status)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="Sem ordens"
                description="Nenhuma ordem de serviço foi criada recentemente."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <CardTitle className="text-lg">Atividade do mês</CardTitle>
          <CardDescription>Volume de atividades nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-700"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  className="fill-slate-500"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  allowDecimals={false}
                  className="fill-slate-500"
                />
                <ChartTooltip
                  cursor={{ fill: 'var(--color-slate-100)', opacity: 0.1 }}
                  content={<ChartTooltipContent />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
