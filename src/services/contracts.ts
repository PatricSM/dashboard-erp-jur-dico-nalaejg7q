import pb from '@/lib/pocketbase/client'

export const getContracts = () =>
  pb.collection('contracts').getFullList({ sort: '-created', expand: 'client_id' })
export const getContractsCount = async (filter: string) => {
  const res = await pb.collection('contracts').getList(1, 1, { filter })
  return res.totalItems
}
export const getContractsTotalValue = async () => {
  const res = await pb.collection('contracts').getFullList({ filter: "status='active'" })
  return res.reduce((acc, curr) => acc + (curr.value || 0), 0)
}
