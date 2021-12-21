import Endpoint from '../../models/Endpoint'

export default async function (app) {
  app.register(require('./session'), { prefix: '/session' })
  app.register(require('./users'), { prefix: '/users' })
  app.register(require('./collections'), { prefix: '/:collectionName' })
}
