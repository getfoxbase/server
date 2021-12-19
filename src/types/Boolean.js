import Base from './Base'

export default class Boolean extends Base {
  static in (value) {
    switch (value) {
      case true:
      case 1:
      case 'yes':
      case 'y':
      case 'true':
        return true
      case false:
      case 0:
      case 'no':
      case 'n':
      case 'false':
        return false
    }

    return !!value
  }

  static getMongooseType () {
    return Boolean
  }
}
