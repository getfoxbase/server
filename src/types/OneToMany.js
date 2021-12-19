import Base from './Base'
import mongoose from 'mongoose'
import Collection from '../models/Collection'
import checkAccess from '../decorators/checkAccess'

export default class OneToMany extends Base {
  static getMongooseType () {
    return mongoose.Types.ObjectId
  }

  static async in (vals, request, fieldConf) {
    if (vals instanceof Array === false) vals = [vals]

    const ret = []
    for (let val of vals) {
      if (typeof val === 'string') {
        ret.push(new mongoose.Types.ObjectId(val))
        continue
      }
      if (typeof val === 'object') {
        if (val.id !== undefined) {
          ret.push(new mongoose.Types.ObjectId(val))
          continue
        }

        // New object, create refered object
        if (
          checkAccess(
            request,
            { code: _ => {}, send: _ => {} },
            fieldConf.ref,
            'write'
          )
        )
          continue

        if (Collection.isProtected(fieldConf.ref)) continue

        const model = await Collection.get(fieldConf.ref)
        if (!model) {
          continue
        }

        const doc = new model()
        await doc.applyValues(val, request)
        await doc.save()
        ret.push(doc._id)
        continue
      }

      ret.push(val)
    }

    return ret
  }

  static out (val) {
    return val.map(v => v._id.toString())
  }

  static eraseConfig () {
    return {
      isArray: true
    }
  }
}
