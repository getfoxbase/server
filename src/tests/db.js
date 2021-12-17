import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import Role from '../models/Role'
import User from '../models/User'
import testConf from '../conf/tests'

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
  await User.createUser(
    testConf.users.user.email,
    '',
    '',
    testConf.users.user.password,
    'en'
  )
  await User.createUser(
    testConf.users.admin.email,
    '',
    '',
    testConf.users.admin.password,
    'en'
  )
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
