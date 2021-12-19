import dayjs from 'dayjs'
import Base from './Base'

export default class Date extends Base {
  static in (value) {
    const date = dayjs(value)
    if (date.isValid()) return date.toDate()
    return null
  }

  static getMongooseType () {
    return Date
  }
}
