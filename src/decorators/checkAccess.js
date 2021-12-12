import { $t } from '../tools/i18n'

export default (req, res, collectionName, accessType, document = null) => {
  if (req.role.allAccess) return false

  if (req.role.collections[collectionName] === undefined) {
    res
      .code(403)
      .send(new Error($t('You do not have access to this resource', req.lang)))
    return true
  }

  if (req.role.collections[collectionName][accessType]) return false

  if (req.role.collections[collectionName].author) {
    req.limitToAuthor = true

    if (
      document !== null &&
      (req.user === null || document._author.toString() !== req.user.id)
    ) {
      res
        .code(403)
        .send(
          new Error($t('You do not have access to this resource', req.lang))
        )
      return true
    }

    return false
  }

  return false
}
