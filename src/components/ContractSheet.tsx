import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateContract, getContractAmendments } from '@/services/contracts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import pb from '@/lib/pocketbase/client'

export function ContractSheet({ contract, open, onOpenChange }: any) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [amendments, setAmendments] = useState<any[]>([])

  useEffect(() => {
    if (open && contract) {
      getContractAmendments(contract.id).then(setAmendments).catch(console.error)
    }
  }, [open, contract])

  if (!contract) return null

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const inicio = fd.get('vigencia_inicio') as string
    const fim = fd.get('vigencia_fim') as string
    if (inicio && fim && new Date(fim) < new Date(inicio)) {
      return toast({
        title: 'Erro',
        description: 'Vigência Fim deve ser maior que Início.',
        variant: 'destructive',
      })
    }

    const file = fd.get('documentos_url') as File
    if (file && file.size === 0) {
      fd.delete('documentos_url')
    }

    setIsLoading(true)
    try {
      await updateContract(contract.id, fd)
      toast({ title: 'Sucesso', description: 'Contrato atualizado com sucesso.' })
      onOpenChange(false)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Contrato: {contract.title}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="amendments" className="flex-1">
              Aditivos
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex-1">
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Valor Mensal (R$)</Label>
                <Input
                  name="value"
                  type="number"
                  step="0.01"
                  defaultValue={contract.value}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Vigência Início</Label>
                <Input
                  name="vigencia_inicio"
                  type="date"
                  defaultValue={contract.vigencia_inicio?.split(' ')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Vigência Fim</Label>
                <Input
                  name="vigencia_fim"
                  type="date"
                  defaultValue={contract.vigencia_fim?.split(' ')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select name="status" defaultValue={contract.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="expired">Vencido</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                Salvar Alterações
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="amendments" className="mt-4 space-y-4">
            {amendments.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum aditivo registrado.</p>
            ) : (
              amendments.map((a) => (
                <div
                  key={a.id}
                  className="p-3 border rounded-md text-sm bg-slate-50 dark:bg-slate-800"
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">{a.description}</p>
                  <p className="text-slate-500">
                    Data: {new Date(a.date).toLocaleDateString('pt-BR')}
                  </p>
                  {a.value_change && (
                    <p className="text-secondary mt-1 font-medium tabular-nums">
                      Alteração: R$ {a.value_change}
                    </p>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="docs" className="mt-4">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label>Substituir Documento</Label>
                <Input
                  name="documentos_url"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
                />
              </div>
              {contract.documentos_url && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm text-emerald-600 font-medium">✅ Documento atual salvo:</p>
                  <a
                    href={pb.files.getUrl(contract, contract.documentos_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-secondary hover:underline"
                  >
                    Ver arquivo
                  </a>
                </div>
              )}
              <Button type="submit" disabled={isLoading} variant="secondary" className="w-full">
                Fazer Upload
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
