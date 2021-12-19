import Float from './Float'
import Base from './Base'

export default class Decimal extends Base {
  static in (value) {
    value = Float.in(value)
    if (value === null) return null
    return parseFloat(value.toFixed(2))
  }

  static getMongooseType () {
    return Number
  }
}
