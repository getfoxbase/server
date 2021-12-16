export default class Base {
  static in (value, fieldConf) {
    return value
  }

  static out (value, fieldConf) {
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
