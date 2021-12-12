import dayjs from 'dayjs'
import Base from './Base'

export default class Date extends Base {
  static in (value) {
    return dayjs(value).toDate()
  }

  static getMongooseType () {
    return Date
  }
}
