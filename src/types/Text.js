import Base from './Base'

export default class Text extends Base {
  static getMongooseType () {
    return String
  }
}
