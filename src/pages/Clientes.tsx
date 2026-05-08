import { Users } from 'lucide-react'
import { EntityListPage } from '@/components/EntityListPage'

export default function Clientes() {
  return <EntityListPage collection="clients" title="Clientes" singular="cliente" icon={Users} />
}
