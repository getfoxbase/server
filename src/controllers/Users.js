import User from '@/models/User'
import { $t } from '@/tools/i18n'
import buildQuery from '@/tools/query'

export default class UsersController {
  static async list (request, reply) {
    if (this.checkAccess(request, reply, '_users', 'read')) return

    try {
      const { page, limit, query, sort } = buildQuery(request)
      const users = await User.paginate(query, {
        page,
        limit,
        sort
      })

      users.docs = users.docs.map(doc => doc.export())

      reply.send(users)
    } catch (err) {
      throw err
    }
  }

  static async get (request, reply) {
    if (request.user.id !== request.params.userId && !request.user.admin) {
      reply
        .code(403)
        .send(new Error($t('You cannot access this resource', request.lang)))
      return
    }

    try {
      const user = await User.findById(request.params.userId).exec()
      if (!user) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
      } else if (this.checkAccess(request, reply, '_users', 'read', user))
        return
      else {
        reply.send(user.export())
      }
    } catch (err) {
      throw err
    }
  }

  static async me (request, reply) {
    if (this.checkAuth(request, reply)) return
    return request.user.export()
  }

  static async create (request, reply) {
    if (this.checkAccess(request, reply, '_users', 'write')) return

    const user = await User.createUser(
      request.body.email,
      request.body.firstname,
      request.body.lastname,
      request.body.password,
      request.lang
    )

    reply.code(201)

    return {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      lang: user.lang,
      pending: user.pending,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    }
  }

  static async edit (request, reply) {
    try {
      const user = await User.findById(request.params.userId)
      if (!user) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      if (this.checkAccess(request, reply, '_users', 'write', user)) return

      for (let key in request.body) {
        if (key === 'admin' && !request.user.admin) continue
        user.set(key, request.body[key])
      }

      await user.save()

      reply.send(user.export(request.user))
    } catch (err) {
      throw err
    }
  }

  static async validate (request, reply) {
    const ret = await User.activateAccountFromValidationCode(
      request.body.code,
      request.body.update ?? {}
    )

    if (!ret) throw new Error($t('Validation code is invalid', request.lang))

    return {
      validated: true
    }
  }

  static async delete (request, reply) {
    try {
      const user = await User.findById(request.params.userId)
      if (!user) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      if (this.checkAccess(request, reply, '_users', 'delete', user)) return

      await user.delete(request.user._id)

      reply.send({
        deleted: true
      })
    } catch (err) {
      throw err
    }
  }

  static async resetPassword (request, reply) {
    const ret = await User.resetPassword(request.body.email)

    if (!ret) throw new Error($t('This account does not exists', request.lang))

    return {
      sent: true
    }
  }

  static async changePassword (request, reply) {
    const ret = await User.changePasswordWithResetCode(
      request.body.code,
      request.body.password
    )

    if (!ret)
      throw new Error(
        $t(
          'Cannot change password, validation code is invalid or expired',
          request.lang
        )
      )

    return {
      changed: true
    }
  }
}
