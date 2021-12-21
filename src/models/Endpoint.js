import mongoose, { Schema } from 'mongoose'
import Functions from './Function'

class Endpoint {
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
