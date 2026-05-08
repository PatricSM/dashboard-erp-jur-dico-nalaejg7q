import { Briefcase } from 'lucide-react'
import { EntityListPage } from '@/components/EntityListPage'

export default function Fornecedores() {
  return (
    <EntityListPage
      collection="suppliers"
      title="Fornecedores"
      singular="fornecedor"
      icon={Briefcase}
    />
  )
}
