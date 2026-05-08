import { useEffect, useState } from 'react'
import { getClients } from '@/services/clients'
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

export default function Clientes() {
  const [clients, setClients] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => getClients().then(setClients)
  useEffect(() => {
    load()
  }, [])
  useRealtime('clients', load)

  const handleAdd = () => {
    toast({ title: 'Aviso', description: 'Funcionalidade de cadastro em desenvolvimento.' })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Clientes
        </h1>
        <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Adicionar Cliente
        </Button>
      </div>
      <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="pl-6">Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="pr-6 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="pl-6 font-medium">{c.name}</TableCell>
                <TableCell className="text-slate-500">{c.email || '-'}</TableCell>
                <TableCell className="text-slate-500">{c.phone || '-'}</TableCell>
                <TableCell className="pr-6 text-right">
                  <Badge
                    className={
                      c.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-0'
                    }
                  >
                    {c.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
