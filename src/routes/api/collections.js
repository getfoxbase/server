import Collections from '@/controllers/Collections'

export default async function (app) {
  app.get('/', Collections.list)
  app.get('/count', Collections.count)
  app.get('/first', Collections.first)
  app.get('/last', Collections.last)
  app.post('/', Collections.create)
  app.post('/bulk', Collections.createBulk)
  app.get('/:docId', Collections.get)
  app.put('/:docId', Collections.replace)
  app.patch('/:docId', Collections.update)
  app.delete('/:docId', Collections.delete)
  app.get('/:docId/:relationName', Collections.listRelation)
  app.post('/:docId/:relationName', Collections.handleEndpoint)
  app.put('/:docId/:relationName', Collections.handleEndpoint)
  app.patch('/:docId/:relationName', Collections.handleEndpoint)
  app.delete('/:docId/:relationName', Collections.handleEndpoint)
}
