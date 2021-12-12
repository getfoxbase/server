import langs from '../conf/langs'

// Load every lang file
const langConfs = {}
for (let lang in langs) {
  langConfs[lang] = require(`../langs/${lang}.json`)
}

const defaultLang = process.env.DEFAULT_LANG ?? 'en'

export function $t (str, lang, vars = {}) {
  let finalStr = str

  if (langConfs[lang]?.[str] !== undefined) {
    finalStr = langConfs[lang]?.[str]
  } else if (langConfs[defaultLang]?.[str] !== undefined) {
    finalStr = langConfs[defaultLang]?.[str]
  }

  for (let key in vars) {
    finalStr = finalStr.replace(`{{${key}}}`, vars[key])
  }

  return finalStr
}

export function getDefaultLang () {
  return defaultLang
}
