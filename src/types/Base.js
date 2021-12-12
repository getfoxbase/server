export default class Base {
  static in (value) {
    return value
  }

  static out (value) {
    return value
  }

  static getMongooseIndex () {
    return null
  }

  static getMongooseType () {
    return String
  }

  static getMongooseOf () {
    return undefined
  }
}
