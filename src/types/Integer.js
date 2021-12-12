import Base from './Base'

export default class Integer extends Base {
  static in (value) {
    return parseInt(`${value}`.replace(/\s/g, '').replace(/,/g, '.'))
  }

  static getMongooseType () {
    return Number
  }
}
