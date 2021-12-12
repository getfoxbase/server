import langs from '../conf/langs'
import { getDefaultLang } from '../tools/i18n'

export default function (req, res, next) {
  let lang = getDefaultLang()

  /**
   * Find language in the accept-language header
   *
   * We use the first fully matched language.
   * If we find only a partial match (only language, not region), then we use this partial match.
   */
  if (req.headers['accept-language'] !== undefined) {
    const headerLanguages = req.headers['accept-language']
      .split(',')
      .map(a => a.trim())
    let testedLanguage = null
    let partialMatch = null
    while ((testedLanguage = headerLanguages.shift())) {
      testedLanguage = testedLanguage.split(';')[0]
      const [mainLang, region] = testedLanguage.split('-')
      if (langs[testedLanguage] !== undefined) {
        lang = testedLanguage
        break
      }
      if (langs[mainLang] !== undefined) {
        partialMatch = mainLang
      }
    }
    if (partialMatch) {
      lang = partialMatch
    }
  }

  req.lang = lang
  next()
}
