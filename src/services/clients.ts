import pb from '@/lib/pocketbase/client'

export const getClients = () => pb.collection('clients').getFullList({ sort: '-created' })
export const createClient = (data: any) => pb.collection('clients').create(data)
