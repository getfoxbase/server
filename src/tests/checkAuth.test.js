import User from '../models/User'
import db from './db'
import testConf from '../conf/tests'
import checkAuth from '../decorators/checkAuth'
import Role from '../models/Role'

let user = null
let userReq = null
let anonymousReq = null
const res = {
  code: () => res,
  send: () => res
}

beforeAll(async () => {
  await db.connect()

  user = await User.loginByPassword(
    testConf.users.user.email,
    testConf.users.user.password
  )

  userReq = {
    user,
    role: await user.getRole()
  }

  anonymousReq = {
    user: null,
    role: await Role.getDefaultAnonymousRole()
  }
})
afterAll(async () => await db.closeDatabase())

describe('CheckAuth decorator', _ => {
  test('Should allow because user is logged in', async () => {
    const ret = checkAuth(userReq, res)
    expect(ret).toBe(false)
  })

  test('Should not allow because user is not logged in', async () => {
    const ret = checkAuth(anonymousReq, res)
    expect(ret).toBe(true)
  })
})
