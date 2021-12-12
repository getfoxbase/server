export default async function (app) {
  app.register(require('./userCollections'), { prefix: '/:collectionName' })
}
