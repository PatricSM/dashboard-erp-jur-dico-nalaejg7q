import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getClients } from '@/services/clients'
import { getContracts } from '@/services/contracts'
import { createServiceOrder } from '@/services/service_orders'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'

export function OSModal() {
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      getClients().then(setClients)
      getContracts().then(setContracts)
    }
  }, [open])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const data: any = {
      title: form.get('title'),
      client_id: form.get('client_id'),
      description: form.get('description'),
      priority: form.get('priority'),
      status: 'open',
    }

    const contrato_id = form.get('contrato_id')
    if (contrato_id && contrato_id !== 'none') {
      data.contrato_id = contrato_id
    }

    try {
      await createServiceOrder(data)
      toast({ title: 'Sucesso', description: 'OS criada com sucesso.' })
      setOpen(false)
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao criar OS.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="animate-pulse shadow-md bg-secondary hover:bg-secondary/90 text-white">
          Nova Ordem de Serviço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required placeholder="Ex: Revisão de Contrato" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_id">Cliente</Label>
            <Select name="client_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contrato_id">Contrato (Opcional)</Label>
            <Select name="contrato_id" defaultValue="none">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o contrato..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {contracts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select name="priority" defaultValue="medium" required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Detalhes da solicitação..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white">
              Criar OS
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
