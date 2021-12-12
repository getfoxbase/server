import Float from './Float'
import Base from './Base'

export default class Decimal extends Base {
  static in (value) {
    return Float.in(value).toFixed(2)
  }

  static getMongooseType () {
    return Number
  }
}
