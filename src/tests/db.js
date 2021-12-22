import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Role from '../models/Role'
import User from '../models/User'
import testConf from '../conf/tests'
import Collection from '../models/Collection'

let mongoServer = null

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = await mongoServer.getUri()

  const mongooseOpts = {
    useNewUrlParser: true,
    dbName: 'tests'
  }

  await mongoose.connect(uri, mongooseOpts)

  await Role.ensureBasicRoles()

  await Role.create({
    name: 'test',
    slug: 'test',
    defaultUserRole: true,
    allAccess: false,
    collections: {
      _users: {
        read: false,
        write: false,
        delete: false,
        author: false,
        admin: false
      },
      test: {
        read: true,
        write: true,
        delete: true,
        author: false,
        admin: false
      }
    },
    deletable: false
  })

  const user = await User.createUser(
    testConf.users.user.email,
    '',
    '',
    testConf.users.user.password,
    'en'
  )
  user.pending = false
  await user.save()

  const pending = await User.createUser(
    testConf.users.pending.email,
    '',
    '',
    testConf.users.pending.password,
    'en'
  )
  await user.save()

  const admin = await User.createUser(
    testConf.users.admin.email,
    '',
    '',
    testConf.users.admin.password,
    'en'
  )
  admin.role = 'admin'
  admin.pending = false
  await admin.save()

  const tester = await User.createUser(
    testConf.users.tester.email,
    '',
    '',
    testConf.users.tester.password,
    'en'
  )
  tester.role = 'test'
  tester.pending = false
  await tester.save()

  await Collection.create({
    name: 'test',
    _author: admin._id,
    fields: {
      myBoolean: {
        type: 'boolean'
      },
      myDate: {
        type: 'date'
      },
      myDecimal: {
        type: 'decimal'
      },
      myFloat: {
        type: 'float'
      },
      myI18nText: {
        type: 'i18n-text'
      },
      myInteger: {
        type: 'integer'
      },
      myLatLng: {
        type: 'latlng'
      },
      myOneToOne: {
        type: 'one-to-one',
        ref: 'addresses'
      },
      myOneToMany: {
        type: 'one-to-many',
        ref: 'images'
      },
      myText: {
        type: 'text'
      }
    }
  })

  await Collection.create({
    name: 'addresses',
    _author: admin._id,
    fields: {
      line1: {
        type: 'text'
      },
      line2: {
        type: 'text'
      },
      zipcode: {
        type: 'text'
      },
      city: {
        type: 'text'
      },
      state: {
        type: 'text'
      },
      country: {
        type: 'text'
      }
    }
  })

  await Collection.create({
    name: 'images',
    _author: admin._id,
    fields: {
      url: {
        type: 'text'
      },
      name: {
        type: 'text'
      }
    }
  })
}

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
}

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany()
  }
}
