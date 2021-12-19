import Base from './Base'

export default class Integer extends Base {
  static in (value) {
    const ret = parseInt(`${value}`.replace(/\s/g, '').replace(/,/g, '.'))
    if (isNaN(ret)) return null
    return ret
  }

  static getMongooseType () {
    return Number
  }
}
