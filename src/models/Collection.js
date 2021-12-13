import mongoose, { Schema } from 'mongoose'
import Types from '../types'

class Collection {
  static clear (name) {
    const protectedModels = ['_collections', '_users', '_roles']
    if (protectedModels.includes(name) === false) mongoose.deleteModel(name)
  }

  static async get (name) {
    try {
      const model = mongoose.model(name)
      return model
    } catch {}

    return await this.setupModel(name)
  }

  static async setupModel (name) {
    const conf = await this.findOne({ name }).exec()
    if (!conf) {
      return undefined
    }

    const schemaConf = {
      _author: {
        type: mongoose.ObjectId
      }
    }
    for (let key in conf.fields ?? {}) {
      schemaConf[key] = {
        ...conf.fields[key],
        type: Types[conf.fields[key].type].getMongooseType(),
        of: Types[conf.fields[key].type].getMongooseOf(),
        index:
          Types[conf.fields[key].type].getMongooseIndex() ??
          conf.fields[key].index ??
          false
      }
    }

    const schema = new Schema(schemaConf, {
      timestamps: true,
      collection: name
    })

    schema.methods.applyValues = async function (
      data,
      request,
      eraseEverything = false
    ) {
      if (eraseEverything) {
        for (let key in conf.fields ?? {}) {
          this.set(key, undefined)
        }
      }

      for (let key in data) {
        if (conf.fields[key] === undefined) continue

        this.set(key, Types[conf.fields[key].type].in(data[key], request))
      }
    }

    schema.methods.export = async function (request, filter = null) {
      let ret = {}

      for (let key in conf.fields ?? {}) {
        if (filter instanceof Array && filter.includes(key)) continue

        ret[key] = Types[conf.fields[key].type].out(this.get(key), request)
      }

      return ret
    }

    schema.statics.formatIn = function (key, value, request) {
      if (conf.fields[key] === undefined) return null

      return Types[conf.fields[key].type].in(value, request)
    }

    schema.statics.canBeGeoSearched = function () {
      for (let key in conf.fields ?? {}) {
        if (conf.fields[key].type === 'latlng') return true
      }
      return false
    }

    schema.statics.getGeoFields = function () {
      const ret = []
      for (let key in conf.fields ?? {}) {
        if (conf.fields[key].type === 'latlng') ret.push(key)
      }
      return ret
    }

    schema.statics.getSearchFields = function () {
      const ret = []
      for (let key in conf.fields ?? {}) {
        if (conf.fields[key].searchable) ret.push(key)
      }
      return ret
    }

    schema.plugin(require('mongoose-autopopulate'))
    schema.plugin(require('mongoose-paginate-v2'))
    schema.plugin(require('mongoose-delete'), {
      deletedAt: true,
      deletedBy: true,
      overrideMethods: true,
      indexFields: ['deleted', 'deletedBy']
    })

    return mongoose.model(name, schema)
  }
}

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      match: /^[a-z_0-9]+$/i,
      unique: true,
      trim: true
    },
    _author: {
      type: mongoose.ObjectId
    },
    fields: {
      type: Map,
      of: new Schema({
        type: {
          type: String,
          enum: Object.keys(Types)
        },
        unique: {
          type: Boolean,
          default: false
        },
        index: {
          type: Boolean,
          default: false
        },
        required: {
          type: Boolean,
          default: false
        },
        default: {
          type: mongoose.Mixed
        },
        min: {
          type: mongoose.Mixed
        },
        max: {
          type: mongoose.Mixed
        },
        enum: {
          type: [mongoose.Mixed]
        },
        minLength: {
          type: Number
        },
        maxLength: {
          type: Number
        },
        match: {
          type: new Schema({
            regex: String,
            flags: String
          })
        },
        lowercase: {
          type: Boolean
        },
        uppercase: {
          type: Boolean
        },
        trim: {
          type: Boolean
        },
        searchable: {
          type: Boolean,
          default: false
        }
      })
    }
  },
  {
    timestamps: true,
    collection: '_collections'
  }
)

schema.loadClass(Collection)

export default mongoose.model('_collections', schema)
