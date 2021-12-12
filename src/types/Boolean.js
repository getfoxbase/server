import Base from './Base'

export default class Boolean extends Base {
  static getMongooseType () {
    return Boolean
  }
}
