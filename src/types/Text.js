import Base from './Base'

export default class Text extends Base {
  static in (value) {
    if (value === null) return null
    return '' + value
  }

  static getMongooseType () {
    return String
  }
}
