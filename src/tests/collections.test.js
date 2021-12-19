import db from './db'
import testConf from '../conf/tests'
import User from '../models/User'
import Collection from '../models/Collection'

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

    const docs = await model.paginate()
    expect(docs.docs.length).toBe(1)
    expect(doc.myBoolean).toBe(true)
  })
})
