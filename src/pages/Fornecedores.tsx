import { useEffect, useState } from 'react'
import { getSuppliers } from '@/services/suppliers'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Fornecedores() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const { toast } = useToast()

  const load = () => getSuppliers().then(setSuppliers)
  useEffect(() => {
    load()
  }, [])
  useRealtime('suppliers', load)

  const handleAdd = () =>
    toast({ title: 'Aviso', description: 'Funcionalidade em desenvolvimento.' })

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Fornecedores
        </h1>
        <Button onClick={handleAdd} className="bg-secondary hover:bg-secondary/90 text-white">
          <Plus className="h-4 w-4 mr-2" /> Novo Fornecedor
        </Button>
      </div>
      <div className="rounded-xl border bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
            <TableRow>
              <TableHead className="pl-6">Nome / Razão Social</TableHead>
              <TableHead>Tipo de Serviço</TableHead>
              <TableHead className="pr-6">Contato</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="pl-6 font-medium">{s.name}</TableCell>
                <TableCell className="text-slate-600">{s.service_type || '-'}</TableCell>
                <TableCell className="pr-6 text-slate-500">{s.contact || '-'}</TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-slate-500">
                  Nenhum fornecedor encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
