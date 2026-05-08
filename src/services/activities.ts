import pb from '@/lib/pocketbase/client'

export const getActivities = async () => {
  return await pb.collection('activities').getList(1, 5, {
    sort: '-created',
    expand: 'user_id',
  })
}
