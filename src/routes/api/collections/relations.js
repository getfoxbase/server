import Collections from '@/controllers/Collections'

export default async function (app) {
  app.get('/', Collections.listRelation)
  app.post('/', Collections.createRelation)
  app.get('/:relatedDocId', Collections.getRelation)
  app.delete('/:relatedDocId', Collections.deleteRelation)
}
