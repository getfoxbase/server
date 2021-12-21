import mongoose, { Schema } from 'mongoose'
import Functions from './Function'

class Endpoint {
  static async handle (request) {
    if (request.params.collectionName === undefined) return null
    if (request.params.docId === undefined) {
      return await this.findOne({
        collectionName: request.params.collectionName,
        documentRelated: false,
        endpoint: request.uri
          .split('?')[0]
          .substr(5 + request.params.collectionName.length + 1),
        method: request.method
      })
    } else {
      return await this.findOne({
        collectionName: request.params.collectionName,
        documentRelated: true,
        endpoint: request.uri
          .split('?')[0]
          .substr(
            5 +
              request.params.collectionName.length +
              1 +
              request.params.docId.length +
              1
          ),
        method: request.method
      })
    }
  }

  async run (request, reply) {
    return await Functions.run(request, reply)
  }
}

const schema = new Schema(
  {
    _author: {
      type: mongoose.ObjectId
    },
    collectionName: {
      type: String,
      trim: true,
      required: true
    },
    documentRelated: {
      type: Boolean,
      default: false
    },
    endpoint: {
      type: String,
      trim: true
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    function: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: '_endpoints'
  }
)

schema.loadClass(Endpoint)

export default mongoose.model('_endpoints', schema)
