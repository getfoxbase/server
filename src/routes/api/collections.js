import Collections from '@/controllers/Collections'

export default async function (app) {
  app.get('/', Collections.list)
  app.post('/', Collections.create)
  app.get('/:docId', Collections.get)
  app.put('/:docId', Collections.replace)
  app.patch('/:docId', Collections.update)
  app.delete('/:docId', Collections.delete)
}
