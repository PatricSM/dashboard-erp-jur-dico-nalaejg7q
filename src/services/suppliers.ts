import pb from '@/lib/pocketbase/client'

export const getSuppliers = () => pb.collection('suppliers').getFullList({ sort: '-created' })
export const createSupplier = (data: any) => pb.collection('suppliers').create(data)
