import UsersController from '@/controllers/Users'

import createUserSchema from '@/validators/users/createUser'
import validateUserSchema from '@/validators/users/validateUser'
import editUserSchema from '@/validators/users/editUser'
import resetPasswordSchema from '@/validators/users/resetPassword'
import changePasswordSchema from '@/validators/users/changePassword'

export default async function (app) {
  app.get('/', UsersController.list)
  app.get('/:userId', UsersController.get)
  app.get('/me', UsersController.me)
  app.post(
    '/',
    {
      schema: createUserSchema
    },
    UsersController.create
  )
  app.post(
    '/validate',
    {
      schema: validateUserSchema
    },
    UsersController.validate
  )
  app.put(
    '/:userId',
    {
      schema: editUserSchema
    },
    UsersController.edit
  )
  app.delete('/:userId', UsersController.delete)
  app.post(
    '/password/reset',
    {
      schema: resetPasswordSchema
    },
    UsersController.resetPassword
  )
  app.post(
    '/password/change',
    {
      schema: changePasswordSchema
    },
    UsersController.resetPassword
  )
}
