import Collections from '@/controllers/Collections'

export default async function (app) {
  app.get('/', Collections.listRelation)
}
