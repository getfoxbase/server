import SessionController from '@/controllers/Session'

import loginSchema from '@/validators/session/login'
import socialSchema from '@/validators/session/social'

export default async function (app) {
  app.post(
    '/',
    {
      schema: loginSchema
    },
    SessionController.login
  )

  app.get(
    '/social/:driver/init',
    { schema: socialSchema },
    SessionController.loginSocialInit
  )
  app.get(
    '/social/:driver/callback',
    { schema: socialSchema },
    SessionController.loginSocialCallback
  )

  app.post('/renew', SessionController.renew)
}
