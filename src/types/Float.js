import Base from './Base'

export default class Float extends Base {
  static in (value) {
    const ret = parseFloat(`${value}`.replace(/\s/g, '').replace(/,/g, '.'))
    if (isNaN(ret)) return null
    return ret
  }

  static getMongooseType () {
    return Number
  }
}
