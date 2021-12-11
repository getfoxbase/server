import mongoose, { Schema, Mixed } from 'mongoose'
import Types from '../types'

class Collection {
  static deleteModel (name) {
    mongoose.deleteModel(name)
  }

  static async get (name) {
    const model = mongoose.model(name)
    if (model === undefined) {
      return await this.setupModel(name)
    }
    return model
  }

  static async setupModel (name) {
    const conf = await this.findOne({ name }).exec()
    if (!conf) {
      return undefined
    }

    const schemaConf = {}
    for (let key in conf.fields ?? {}) {
      schemaConf[key] = {
        ...conf.fields[key],
        type: Types[conf.fields[key].type].getMongooseType()
      }
    }

    const schema = new Schema(schemaConf, {
      timestamps: true,
      collection: name
    })

    schema.methods.applyValues = async function (
      data,
      eraseEverything = false
    ) {
      if (eraseEverything) {
        for (let key in conf.fields ?? {}) {
          this.set(key, undefined)
        }
      }

      for (let key in data) {
        if (conf.fields[key] === undefined) continue

        this.set(key, await Types[conf.fields[key].type].in(data[key]))
      }
    }

    schema.methods.export = async function (filter = null) {
      let ret = {}

      for (let key in conf.fields ?? {}) {
        if (filter instanceof Array && filter.includes(key)) continue

        ret[key] = await Types[conf.fields[key].type].out(this.get(key))
      }

      return ret
    }

    return mongoose.model(name, schema)
  }
}

const configurationFields = {
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
    type: Mixed
  }
}

for (let typeName in Types) {
  const confs = Types[typeName].getConfigurationFields()
  for (let confKey in confs) {
    configurationFields[confKey] = confs[confKey]
  }
}

const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      match: /^[a-z_0-9]+$/,
      unique: true,
      trim: true
    },
    fields: {
      type: Map,
      of: new Schema(configurationFields)
    }
  },
  {
    timestamps: true,
    collection: '_collections'
  }
)

schema.loadClass(Collection)
schema.plugin(require('mongoose-autopopulate'))
schema.plugin(require('mongoose-paginate-v2'))
schema.plugin(require('mongoose-delete'), {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: true,
  indexFields: ['deleted', 'deletedBy']
})

export default mongoose.model('_collections', schema)
