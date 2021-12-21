import mongoose, { Schema } from 'mongoose'

class Endpoint {}

const schema = new Schema(
  {
    _author: {
      type: mongoose.ObjectId
    },
    mode: {
      type: String,
      required: true,
      enum: ['collection', 'global']
    },
    collectionName: {
      type: String,
      trim: true
    },
    documentRelated: {
      type: Boolean,
      default: false
    },
    endpoint: {
      type: String,
      trim: true
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
