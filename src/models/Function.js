import mongoose, { Schema } from 'mongoose'
import cachegoose from 'cachegoose'
import { Builder } from '@foxbase/extensions'
import Collection from './Collection'

class Functions {
  async build () {
    switch (this.source) {
      case 'files':
        this.code = await Builder.build(this.source)
        break
      case 'git':
        this.code = await Builder.buildFromGit(this.repository)
        break
    }
  }

  async run (req, res) {
    const module = eval(this.code)

    let doc = null
    if (
      req.params.collectionName !== undefined &&
      req.params.docId !== undefined
    ) {
      const model = await Collection.get(req.params.collectionName)
      if (!model) {
        res.code(404).send(
          new Error(
            $t('"{name}" collection does not exists', req.lang, {
              name: req.params.collectionName
            })
          )
        )
        return null
      }
      doc = await model.findById(req.params.docId).exec()
    }

    let payload = {
      Collection,
      req,
      res,
      doc
    }
    if (this.entrypoint.trim() === '') {
      return await module(payload)
    }
    return await module[this.entrypoint](payload)
  }

  static async run (name, req, res) {
    const func = await this.findOne({ name })
      .cache(0, `function-${name}`)
      .exec()
    if (!func) throw new Error($t('Unknown function "{{name}}"', { name }))

    return await func.run(req, res)
  }

  static async saveFunction (name, req) {
    let func = await this.findOne({ name }).exec()
    if (!func) {
      func = new this({
        _author: req.user._id,
        name
      })
    }

    func.source = req.body.source
    func.files = {}
    func.repository = ''
    func.entrypoint = req.body.entrypoint ?? ''

    switch (func.source) {
      case 'files':
        if (req.body.files === undefined)
          throw new Error($t('You must add files to your function'))
        func.files = req.body.files
        break
      case 'git':
        if (req.body.repository === undefined)
          throw new Error($t('You must add repository to your function'))
        func.repository = req.body.repository
        break
    }
    await func.build()
    await func.save()

    // clear cache
    cachegoose.clearCache(`function-${func.name}`)

    return {
      id: func.id,
      name: func.name,
      source: func.source
    }
  }
}

const schema = new Schema(
  {
    _author: {
      type: mongoose.ObjectId
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    source: {
      type: String,
      enum: ['files', 'git']
    },
    files: {
      type: Map,
      of: String
    },
    repository: {
      type: String
    },
    entrypoint: {
      type: String,
      default: ''
    },
    code: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: '_functions'
  }
)

schema.loadClass(Functions)

export default mongoose.model('_functions', schema)
