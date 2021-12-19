import db from './db'
import Types from '../types'

beforeAll(async () => await db.connect())
afterAll(async () => await db.closeDatabase())

describe('Types', _ => {
  test('Boolean', async () => {
    expect(await Types.boolean.in(true)).toBe(true)
    expect(await Types.boolean.in('true')).toBe(true)
    expect(await Types.boolean.in(1)).toBe(true)
    expect(await Types.boolean.in(42)).toBe(true)
    expect(await Types.boolean.in('yes')).toBe(true)
    expect(await Types.boolean.in('y')).toBe(true)
    expect(await Types.boolean.in(false)).toBe(false)
    expect(await Types.boolean.in('false')).toBe(false)
    expect(await Types.boolean.in(0)).toBe(false)
    expect(await Types.boolean.in('')).toBe(false)
    expect(await Types.boolean.in('no')).toBe(false)
    expect(await Types.boolean.in('n')).toBe(false)
  })

  test('Date', async () => {
    const ret = await Types.date.in('2020-01-12 12:42:50')
    expect(ret instanceof Date).toBe(true)

    const invalid = await Types.date.in('incorrect value')
    expect(invalid).toBe(null)
  })

  test('Decimal', async () => {
    expect(await Types.decimal.in(271.345)).toBe(271.35)
    expect(await Types.decimal.in(271)).toBe(271)
    expect(await Types.decimal.in('848,26782')).toBe(848.27)
    expect(await Types.decimal.in('My awesomly wrong value')).toBe(null)
  })

  test('Float', async () => {
    expect(await Types.float.in(271.345)).toBe(271.345)
    expect(await Types.float.in(271)).toBe(271)
    expect(await Types.float.in('271 is good')).toBe(271)
    expect(await Types.float.in('My awesomly wrong value')).toBe(null)
  })

  test('Integer', async () => {
    expect(await Types.integer.in(271.345)).toBe(271)
    expect(await Types.integer.in(271)).toBe(271)
    expect(await Types.integer.in('271')).toBe(271)
    expect(await Types.integer.in('My awesomly wrong value')).toBe(null)
  })
})
