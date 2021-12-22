import User from '../models/User'
import db from './db'
import testConf from '../conf/tests'
import checkAccess from '../decorators/checkAccess'

let user = null
let admin = null
let tester = null
let userReq = null
let adminReq = null
let testerReq = null
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

  admin = await User.loginByPassword(
    testConf.users.admin.email,
    testConf.users.admin.password
  )

  tester = await User.loginByPassword(
    testConf.users.tester.email,
    testConf.users.tester.password
  )

  userReq = {
    user,
    role: await user.getRole()
  }

  adminReq = {
    user: admin,
    role: await admin.getRole()
  }

  testerReq = {
    user: tester,
    role: await tester.getRole()
  }
})
afterAll(async () => await db.closeDatabase())

describe('CheckAccess decorator', _ => {
  test('Should have read access with admin', async () => {
    const ret = checkAccess(adminReq, res, 'test', 'read')
    expect(ret).toBe(false)
  })

  test('Should have write access with admin', async () => {
    const ret = checkAccess(adminReq, res, 'test', 'write')
    expect(ret).toBe(false)
  })

  test('Should have delete access with admin', async () => {
    const ret = checkAccess(adminReq, res, 'test', 'delete')
    expect(ret).toBe(false)
  })

  test('Should not have read access with user', async () => {
    const ret = checkAccess(userReq, res, 'test', 'read')
    expect(ret).toBe(true)
  })

  test('Should not have write access with user', async () => {
    const ret = checkAccess(userReq, res, 'test', 'write')
    expect(ret).toBe(true)
  })

  test('Should not have delete access with user', async () => {
    const ret = checkAccess(userReq, res, 'test', 'delete')
    expect(ret).toBe(true)
  })

  test('Should have read access with user with authored document', async () => {
    const ret = checkAccess(userReq, res, '_users', 'read', {
      _author: user._id
    })
    expect(ret).toBe(false)
  })

  test('Should have write access with user with authored document', async () => {
    const ret = checkAccess(userReq, res, '_users', 'write', {
      _author: user._id
    })
    expect(ret).toBe(false)
  })

  test('Should have delete access with user with authored document', async () => {
    const ret = checkAccess(userReq, res, '_users', 'delete', {
      _author: user._id
    })
    expect(ret).toBe(false)
  })

  test('Should not have read access with user with authored document but wrong user', async () => {
    const ret = checkAccess(userReq, res, '_users', 'read', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should not have write access with user with authored document but wrong user', async () => {
    const ret = checkAccess(userReq, res, '_users', 'write', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should not have delete access with user with authored document but wrong user', async () => {
    const ret = checkAccess(userReq, res, '_users', 'delete', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should not have read access with user with authored document but user have no author access', async () => {
    const ret = checkAccess(testerReq, res, '_users', 'read', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should not have write access with user with authored document but user have no author access', async () => {
    const ret = checkAccess(testerReq, res, '_users', 'write', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should not have delete access with user with authored document but user have no author access', async () => {
    const ret = checkAccess(testerReq, res, '_users', 'delete', {
      _author: admin._id
    })
    expect(ret).toBe(true)
  })

  test('Should have read access with user with authored document', async () => {
    const ret = checkAccess(testerReq, res, 'test', 'read', {
      _author: admin._id
    })
    expect(ret).toBe(false)
  })

  test('Should have write access with user with authored document', async () => {
    const ret = checkAccess(testerReq, res, 'test', 'write', {
      _author: admin._id
    })
    expect(ret).toBe(false)
  })

  test('Should have delete access with user with authored document', async () => {
    const ret = checkAccess(testerReq, res, 'test', 'delete', {
      _author: admin._id
    })
    expect(ret).toBe(false)
  })
})
