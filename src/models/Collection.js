import mongoose, { Schema } from 'mongoose'
import Types from '../types'

class Collection {
  static isProtected (name) {
    return ['_collections', '_users', '_roles'].includes(name)
  }

  static clear (name) {
    if (!this.isProtected(name)) mongoose.deleteModel(name)
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

    let fieldConf = {}

    const schemaConf = {
      _author: {
        type: mongoose.ObjectId
      }
    }
    for (const [key, field] of conf.fields.entries()) {
      if (Types[field.type] === undefined) {
        throw new Error(`Type "${field.type}" not found`)
      }

      fieldConf = {
        ...field.toJSON(),
        type: Types[field.type].getMongooseType(),
        of: Types[field.type].getMongooseOf(),
        index: Types[field.type].getMongooseIndex() ?? field.index ?? false,
        ...Types[field.type].eraseConfig()
      }

      if (
        fieldConf.enum !== undefined &&
        (fieldConf.enum instanceof Array === false ||
          fieldConf.enum.length === 0)
      )
        delete fieldConf.enum

      if (fieldConf.isArray) fieldConf = [fieldConf]

      schemaConf[key] = fieldConf
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
        for (let [key, field] of conf.fields.entries()) {
          this.set(key, undefined)
        }
      }

      let value = null
      for (let key in data) {
        if (conf.fields.has(key) === false) continue
        value = await Types[conf.fields.get(key).type].in(
          data[key],
          request,
          conf.fields.get(key)
        )
        this.set(key, value)
      }
    }

    schema.methods.export = async function (request, filter = null) {
      let ret = {
        id: this.id
      }
      let docs = []

      if (filter !== null) {
        for (let field of filter) {
          if (conf.fields.get(field.field) === undefined) continue

          switch (conf.fields.get(field.field).type) {
            case 'one-to-one':
              await this.populate(field.field)
              ret[field.field] = await this.get(field.field).export(
                request,
                field.sub.length ? field.sub : null
              )
              break
            case 'one-to-many':
              await this.populate(field.field)
              docs = []
              for (let doc of this.get(field.field))
                docs.push(
                  await doc.export(request, field.sub.length ? field.sub : null)
                )
              ret[field.field] = docs
              break
            default:
              ret[field.field] = await Types[
                conf.fields.get(field.field).type
              ].out(this.get(field.field), request, conf.fields.get(key))
              break
          }
        }
      } else {
        for (let [key, field] of conf.fields.entries()) {
          ret[key] = await Types[field.type].out(this.get(key), request, field)
        }
      }

      ret._links = {
        self: `${request.protocol}://${request.hostname}/api/${name}/${this.id}`
      }

      return ret
    }

    schema.statics.formatIn = async function (key, value, request) {
      if (conf.fields.get(key) === undefined) return null

      return await Types[conf.fields.get(key).type].in(
        value,
        request,
        conf.fields.get(key)
      )
    }

    schema.statics.getConfiguration = function () {
      return conf.fields.get(key)
    }

    schema.statics.canBeGeoSearched = function () {
      for (let key in conf.fields ?? {}) {
        if (conf.fields.get(key).type === 'latlng') return true
      }
      return false
    }

    schema.statics.getGeoFields = function () {
      const ret = []
      for (let key in conf.fields ?? {}) {
        if (conf.fields.get(key).type === 'latlng') ret.push(key)
      }
      return ret
    }

    schema.statics.getSearchFields = function () {
      const ret = []
      for (let key in conf.fields ?? {}) {
        if (conf.fields.get(key).searchable) ret.push(key)
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
        ref: {
          type: String
        },
        isArray: {
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
