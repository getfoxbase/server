import db from './db'
import testConf from '../conf/tests'
import User from '../models/User'
import Collection from '../models/Collection'
import mongoose from 'mongoose'

let user = null
let userReq = null
let model = null
const res = {
  code: () => res,
  send: () => res
}

beforeAll(async () => {
  await db.connect()

  user = await User.loginByPassword(
    testConf.users.admin.email,
    testConf.users.admin.password
  )

  userReq = {
    user,
    role: await user.getRole()
  }

  model = await Collection.get('test')
})
afterAll(async () => await db.closeDatabase())

describe('Collections', _ => {
  test('Have a "test" collection', async () => {
    expect(model).toBeDefined()
  })

  test('Handles models correctly', async () => {
    expect(model).toBeDefined()

    let docs = await model.paginate()
    expect(docs.docs.length).toBe(0)

    const doc = new model()
    await doc.applyValues(
      {
        myBoolean: true,
        myDate: '2020-01-01 16:42:00',
        myDecimal: 12.345,
        myFloat: 12.345,
        myI18nText: {
          fr: 'Mon texte',
          en: 'My text'
        },
        myInteger: 12.345,
        myLatLng: '45.4103511,0.0103859',
        myOneToOne: {
          line1: '12, code road',
          zipcode: '12345',
          city: 'Code city',
          country: 'FR'
        },
        myOneToMany: [
          {
            url: 'https://example.com/image.png',
            name: 'My image'
          }
        ],
        myText: 'My uber text'
      },
      userReq
    )
    await doc.save()
    console.log(doc)

    expect(doc.id).toBeDefined()
    expect(doc.myOneToMany instanceof Array).toBe(true)
    expect(doc.myOneToMany.length).toBe(1)
    expect(doc.myBoolean).toBe(true)
    expect(doc.myDate.getFullYear()).toBe(2020)
    expect(doc.myDecimal).toBe(12.35)
    expect(doc.myFloat).toBe(12.345)
    expect(doc.myInteger).toBe(12)
    expect(doc.myI18nText.has('fr')).toBe(true)
    expect(doc.myI18nText.get('fr')).toBe('Mon texte')
    expect(doc.myLatLng.type).toBe('Point')
    expect(doc.myOneToOne instanceof mongoose.Types.ObjectId).toBe(true)
    expect(doc.myText).toBe('My uber text')

    docs = await model.paginate()
    expect(docs.docs.length).toBe(1)

    await doc.delete(user._id)

    docs = await model.paginate()
    expect(docs.docs.length).toBe(0)
  })
})
