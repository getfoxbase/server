import { $t } from '../tools/i18n'

export default (req, res) => {
  if (req.user === null) {
    res.code(403).send(new Error($t('You are not authenticated', req.lang)))
    return true
  }

  return false
}
