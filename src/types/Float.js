import Base from './Base'

export default class Float extends Base {
  static in (value) {
    return parseFloat(`${value}`.replace(/\s/g, '').replace(/,/g, '.'))
  }

  static getMongooseType () {
    return Number
  }
}
