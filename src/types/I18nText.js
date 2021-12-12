import { getDefaultLang } from '../tools/i18n'
import Base from './Base'

export default class I18nText extends Base {
  static in (value, request) {
    if (typeof value === 'string') {
      const o = {}
      o[request.lang] = value
      return o
    }
    return value
  }

  static out (value, request) {
    if (['true', 'on', 'yes', '1'].includes(request.headers['X-I18N'])) {
      return (
        value[request.lang] ??
        value[getDefaultLang()] ??
        value[Object.keys(value)[0]]
      )
    }
    return value
  }

  static getMongooseType () {
    return Map
  }

  static getMongooseOf () {
    return String
  }
}
