import Base from './Base'
import mongoose from 'mongoose'
import Collection from '../models/Collection'

export default class OneToOne extends Base {
  static getMongooseType () {
    return mongoose.Types.ObjectId
  }

  static async in (val, request, fieldConf) {
    if (typeof val === 'string') return new mongoose.Types.ObjectId(val)
    if (typeof val === 'object') {
      if (val.id !== undefined) return new mongoose.Types.ObjectId(val)

      // New object, create refered object
      if (
        this.checkAccess(
          request,
          { code: _ => {}, send: _ => {} },
          fieldConf.ref,
          'write'
        )
      )
        return null

      if (Collection.isProtected(fieldConf.ref)) return null

      const model = await Collection.get(fieldConf.ref)
      if (!model) {
        return null
      }

      const doc = new model()
      await doc.applyValues(val, request)
      await doc.save()
      return doc._id
    }

    return val
  }

  static out (val) {
    if (val) return val._id.toString()
    return null
  }
}
