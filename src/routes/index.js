export default async function (app) {
  app.register(require('./api'), { prefix: '/api' })
}
