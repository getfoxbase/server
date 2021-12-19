import db from './db'
import Types from '../types'
import Collection from '../models/Collection'
import testConf from '../conf/tests'
import User from '../models/User'
import mongoose from 'mongoose'

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

  test('I18n-Text', async () => {
    const req = {
      lang: 'en',
      headers: {}
    }
    expect((await Types['i18n-text'].in('test', req)).en).toBe('test')
    expect((await Types['i18n-text'].in(12, req)).en).toBe('12')
    expect(
      (
        await Types['i18n-text'].in(
          {
            en: 'ok',
            fr: 'test'
          },
          req
        )
      ).en
    ).toBe('ok')
    expect(
      (
        await Types['i18n-text'].out(
          {
            en: 'ok',
            fr: 'test'
          },
          req
        )
      ).en
    ).toBe('ok')
    expect(
      await Types['i18n-text'].out(
        {
          en: 'ok',
          fr: 'test'
        },
        {
          lang: 'en',
          headers: {
            'X-I18N': 'true'
          }
        }
      )
    ).toBe('ok')
  })

  test('LatLng', async () => {
    const test = await Types.latlng.in('44.4392266,0.3555056')
    expect(test.type).toBe('Point')
    expect(test.coordinates[0]).toBe(0.3555056)
    expect(test.coordinates[1]).toBe(44.4392266)

    const testOut = await Types.latlng.out(test)
    expect(testOut.lat).toBe(44.4392266)
    expect(testOut.lng).toBe(0.3555056)

    const test2 = await Types.latlng.in({
      lat: 44.4392266,
      lng: 0.3555056
    })
    expect(test.type).toBe('Point')
    expect(test.coordinates[0]).toBe(0.3555056)
    expect(test.coordinates[1]).toBe(44.4392266)
  })

  test('Text', async () => {
    expect(await Types.text.in('test')).toBe('test')
    expect(await Types.text.in(12)).toBe('12')
    expect(await Types.text.in(null)).toBe(null)
  })

  test('One to One', async () => {
    const model = await Collection.get('test')
    const user = await User.loginByPassword(
      testConf.users.admin.email,
      testConf.users.admin.password
    )
    const userReq = {
      user,
      role: await user.getRole()
    }
    const doc = new model()
    await doc.applyValues(
      {
        myOneToOne: {
          line1: '12, code road',
          zipcode: '12345',
          city: 'Code city',
          country: 'FR'
        }
      },
      userReq
    )
    await doc.save()

    expect(doc.myOneToOne._id).toBeDefined()
    expect(doc.myOneToOne._id instanceof mongoose.Types.ObjectId).toBe(true)
    expect(
      (await Types['one-to-one'].in('61bfa1a2fd835d7fdf6869fe')).toString()
    ).toBe('61bfa1a2fd835d7fdf6869fe')
    expect(
      (
        await Types['one-to-one'].in(
          new mongoose.Types.ObjectId('61bfa1a2fd835d7fdf6869fe')
        )
      ).toString()
    ).toBe('61bfa1a2fd835d7fdf6869fe')
  })

  test('One to Many', async () => {
    const model = await Collection.get('test')
    const user = await User.loginByPassword(
      testConf.users.admin.email,
      testConf.users.admin.password
    )
    const userReq = {
      user,
      role: await user.getRole()
    }
    const doc = new model()
    await doc.applyValues(
      {
        myOneToMany: [
          {
            url: 'https://example.com/image.png',
            name: 'My image'
          }
        ]
      },
      userReq
    )
    await doc.save()

    expect(doc.myOneToMany[0]._id).toBeDefined()
    expect(doc.myOneToMany[0]._id instanceof mongoose.Types.ObjectId).toBe(true)
    expect(
      (
        await Types['one-to-many'].in(['61bfa1a2fd835d7fdf6869fe'])
      )[0].toString()
    ).toBe('61bfa1a2fd835d7fdf6869fe')
    expect(
      (
        await Types['one-to-many'].in([
          new mongoose.Types.ObjectId('61bfa1a2fd835d7fdf6869fe')
        ])
      )[0].toString()
    ).toBe('61bfa1a2fd835d7fdf6869fe')
  })
})
