import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, ClipboardList, DollarSign, Activity } from 'lucide-react'
import { getContractsCount, getContractsTotalValue } from '@/services/contracts'
import { getServiceOrdersCount } from '@/services/service_orders'
import { getActivities } from '@/services/activities'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Index() {
  const [metrics, setMetrics] = useState({ active: 0, expiring: 0, openOS: 0, billing: 0 })
  const [activities, setActivities] = useState<any[]>([])

  const loadMetrics = async () => {
    const next30 = new Date(Date.now() + 30 * 86400000).toISOString()
    const [active, expiring, openOS, billing] = await Promise.all([
      getContractsCount("status='active'"),
      getContractsCount(`status='active' && vigencia_fim <= '${next30}' && vigencia_fim != ''`),
      getServiceOrdersCount("status='open' || status='in_progress'"),
      getContractsTotalValue(),
    ])
    setMetrics({ active, expiring, openOS, billing })
  }

  const loadActs = async () =>
    getActivities()
      .then((res) => setActivities(res.items))
      .catch(() => {})

  useEffect(() => {
    loadMetrics()
    loadActs()
  }, [])
  useRealtime('contracts', loadMetrics)
  useRealtime('service_orders', loadMetrics)
  useRealtime('activities', loadActs)

  const fmtCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const fmtDate = (str: string) => new Date(str).toLocaleString('pt-BR')

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        Dashboard Overview
      </h1>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Contratos Ativos
            </CardTitle>
            <FileText className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.active}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              A Vencer (30 dias)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{metrics.expiring}</div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              OS em Aberto
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.openOS}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Faturamento Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {fmtCurrency(metrics.billing)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-indigo-500" /> Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[180px] pl-6">Data</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead className="pr-6 text-right">Usuário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-6 whitespace-nowrap text-sm text-slate-500">
                      {fmtDate(a.created)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                      {a.description}
                    </TableCell>
                    <TableCell className="pr-6 text-right text-sm text-slate-500">
                      {a.expand?.user_id?.name || 'Sistema'}
                    </TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                      Nenhuma atividade recente.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
