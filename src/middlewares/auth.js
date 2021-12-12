import User from '../models/User'

export default async function (req, res) {
  if (req.headers.authorization === undefined) return

  const [mode, token] = req.headers.authorization.split(' ')

  switch (mode) {
    case 'Bearer':
      req.user = await User.getUserByJwt(token)
      req.token = User.parseJwt(token)
      break
    case 'Basic':
      const buff = Buffer.from(token, 'base64')
      const [user, pass] = buff.toString('ascii').split(':')
      req.user = await User.loginByPassword(user, pass)
      break
  }

  if (req.user && req.user.lang !== req.lang) {
    req.user.lang = req.lang
    await req.user.save()
  }
}
