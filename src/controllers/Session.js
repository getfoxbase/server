import User from '@/models/User'
import { $t } from '@/tools/i18n'
import providers from '@/conf/providers'
import { buildUrl } from '@/tools/url'

export default class SessionController {
  static async login (request, reply) {
    const user = await User.loginByPassword(
      request.body.email,
      request.body.password
    )

    if (!user) {
      throw new Error($t('Your credentials are not valid', request.lang))
    }

    return user.getJWT(request.body.askLongToken)
  }

  static async renew (request, reply) {
    if (request.user === null) {
      throw new Error($t('You are not authenticated', request.lang))
    }
    if (request.token === null) {
      throw new Error(
        $t('You are not authenticated with a token', request.lang)
      )
    }

    return request.user.getJWT(request.token.isLongToken)
  }

  static async loginSocialInit (request, reply) {
    if (providers[request.params.driver] === undefined) {
      throw new Error($t('No such provider', request.lang))
    }

    const driver = new providers[request.params.driver].driver()
    const url = await driver.getRedirectUri(
      request.query.redirect,
      request.query.askLongToken === 'true'
    )

    reply.redirect(302, url)
  }

  static async loginSocialCallback (request, reply) {
    if (providers[request.params.driver] === undefined) {
      throw new Error($t('No such provider', request.lang))
    }

    const driver = new providers[request.params.driver].driver()
    const ret = await driver.callback(request.query)

    let existingUser = await User.getUserBySocialId(
      request.params.driver,
      ret.id
    )
    if (existingUser) {
      reply.redirect(
        302,
        buildUrl(ret.redirect, {
          token: existingUser.getJWT(ret.askLongToken).jwt
        })
      )
      return
    }

    existingUser = await User.findOne({ email: ret.email }).exec()
    if (existingUser) {
      existingUser.setSocialId(request.params.driver, ret.id)
      existingUser.pending = false
      existingUser.validationCode = ''
      existingUser.lang = request.lang
      await existingUser.save()
      reply.redirect(
        302,
        buildUrl(ret.redirect, {
          token: existingUser.getJWT(ret.askLongToken).jwt
        })
      )
      return
    }

    existingUser = new User({
      ...(ret.preset ?? {}),
      pending: false,
      validationCode: '',
      lang: request.lang
    })
    existingUser.setSocialId(request.params.driver, ret.id)

    await existingUser.save()
    await existingUser.notify('welcome', {
      firstname: existingUser.firstname
    })
    reply.redirect(
      302,
      buildUrl(ret.redirect, {
        token: existingUser.getJWT(ret.askLongToken).jwt
      })
    )
  }
}
