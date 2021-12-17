import User from '../models/User'
import db from './db'
import testConf from '../conf/tests'

beforeAll(async () => await db.connect())
afterAll(async () => await db.closeDatabase())

describe('Auth', _ => {
  test('Should log in with basic user', async () => {
    const ret = await User.loginByPassword(
      testConf.users.user.email,
      testConf.users.user.password
    )
    expect(ret).toBeDefined()
    expect(ret.role).toBe('user')
    expect(ret.email).toBe(testConf.users.user.email)
  })

  test('Should log in with admin user', async () => {
    const ret = await User.loginByPassword(
      testConf.users.admin.email,
      testConf.users.admin.password
    )
    expect(ret).toBeDefined()
    expect(ret.role).toBe('admin')
    expect(ret.email).toBe(testConf.users.admin.email)
  })

  test('Should not log in with incorrect user', async () => {
    const ret = await User.loginByPassword(testConf.users.admin.email, 'pwet')
    expect(ret).toBeNull()
  })

  test('Should not log in with pending user', async () => {
    expect.assertions(1)
    try {
      await User.loginByPassword(
        testConf.users.pending.email,
        testConf.users.pending.password
      )
    } catch (e) {
      expect(e.message).toBe(
        'This account is not validated. Please check your mailbox and validate your account.'
      )
    }
  })
})
