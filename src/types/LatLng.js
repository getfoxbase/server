import { Schema } from 'mongoose'
import Base from './Base'
import Float from './Float'

export default class LatLng extends Base {
  static in (value) {
    if (typeof value === 'string') {
      value = value.split(',').map(v => Float.in(v))
      value = {
        lat: value[0],
        lng: value[1]
      }
    }

    return {
      type: 'Point',
      coordinates: [value.lng, value.lat]
    }
  }

  static out (value) {
    if (!value) return value

    return {
      lat: value.coordinates[1],
      lng: value.coordinates[0]
    }
  }

  static getMongooseType () {
    return new Schema({
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    })
  }

  static getMongooseIndex () {
    return '2dsphere'
  }
}
