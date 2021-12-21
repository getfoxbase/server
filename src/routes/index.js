import I18nMiddleware from '../middlewares/i18n'
import AuthMiddleware from '../middlewares/auth'
import CheckAuthDecorator from '../decorators/checkAuth'
import CheckAccessDecorator from '../decorators/checkAccess'
import NotFoundDecorator from '../decorators/notFound'

function decorators (app) {
  app.decorateRequest('lang', '')
  app.decorateRequest('user', null)
  app.decorateRequest('role', null)
  app.decorateRequest('token', null)
  app.decorateRequest('limitToAuthor', false)
  app.decorate('checkAuth', CheckAuthDecorator)
  app.decorate('checkAccess', CheckAccessDecorator)
  app.decorate('notFound', NotFoundDecorator)
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
  app.setNotFoundHandler(app.notFound)
  middlewares(app)
  routes(app)
}
