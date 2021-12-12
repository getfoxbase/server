import UserCollections from '@/controllers/UserCollections'

export default async function (app) {
  app.get('/', UserCollections.list)
  app.post('/', UserCollections.create)
  app.get('/:docId', UserCollections.get)
  app.put('/:docId', UserCollections.replace)
  app.patch('/:docId', UserCollections.update)
  app.delete('/:docId', UserCollections.delete)
}
