import pb from '@/lib/pocketbase/client'

export const getSuppliers = () => pb.collection('suppliers').getFullList({ sort: '-created' })
export const getSupplier = (id: string) => pb.collection('suppliers').getOne(id)
export const createSupplier = (data: any) => pb.collection('suppliers').create(data)
export const updateSupplier = (id: string, data: any) => pb.collection('suppliers').update(id, data)
export const deleteSupplier = (id: string) => pb.collection('suppliers').delete(id)
