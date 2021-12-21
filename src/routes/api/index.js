import Endpoint from '../../models/Endpoint'

export default async function (app) {
  app.register(require('./session'), { prefix: '/session' })
  app.register(require('./users'), { prefix: '/users' })
  app.register(require('./collections'), { prefix: '/:collectionName' })

  // app.register(function (instance, options, done) {
  //   instance.setNotFoundHandler(async function (request, reply) {
  //     const endpoint = await Endpoint.findGlobal(request.url.substr(4))
  //     if (!endpoint) {

  //     }
  //   })
  //   done()
  // })
}
