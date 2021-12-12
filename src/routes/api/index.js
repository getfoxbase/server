export default async function (app) {
  app.register(require('./collections'), { prefix: '/:collectionName' })
}
