import I18nMiddleware from '../middlewares/i18n'
import AuthMiddleware from '../middlewares/auth'

function decorators (app) {
  app.decorateRequest('lang', '')
  app.decorateRequest('user', null)
}

function middlewares (app) {
  app.addHook('preHandler', I18nMiddleware)
  app.addHook('preHandler', AuthMiddleware)
}

function routes (app) {
  app.register(require('./api'), { prefix: '/api' })
}

export default function (app) {
  decorators(app)
  middlewares(app)
  routes(app)
}
