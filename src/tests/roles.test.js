import db from './db'
import Role from '../models/Role'

beforeAll(async () => await db.connect())
afterAll(async () => await db.closeDatabase())

describe('Roles', _ => {
  test('Have 3 basic roles', async () => {
    const expectedRoles = ['anonymous', 'user', 'admin']

    let role = null
    for (let role of expectedRoles) {
      role = await Role.getRole(role)
      expect(role).toBeDefined()
    }
  })
})
