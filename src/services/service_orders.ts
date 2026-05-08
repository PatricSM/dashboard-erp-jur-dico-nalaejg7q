import pb from '@/lib/pocketbase/client'

export const getServiceOrders = () =>
  pb.collection('service_orders').getFullList({ sort: '-created', expand: 'client_id,contrato_id' })

export const getServiceOrdersCount = async (filter: string) => {
  const res = await pb.collection('service_orders').getList(1, 1, { filter })
  return res.totalItems
}

export const createServiceOrder = (data: any) => pb.collection('service_orders').create(data)
