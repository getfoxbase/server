import { Schema } from 'mongoose'
import Base from './Base'

export default class Text extends Base {
  static getMongooseType () {
    return String
  }

  static getConfigurationFields () {
    return {
      minLength: {
        type: Number,
        nullable: true
      },
      maxLength: {
        type: Number,
        nullable: true
      },
      match: {
        type: new Schema({
          regex: String,
          flags: String
        }),
        nullable: true
      },
      lowercase: {
        type: Boolean,
        default: false
      },
      uppercase: {
        type: Boolean,
        default: false
      },
      trim: {
        type: Boolean,
        default: false
      },
      enum: {
        type: [String]
      }
    }
  }
}
