import { $t } from '../tools/i18n'

export default (req, res, collectionName, accessType, document = null) => {
  if (req.role.allAccess) return false

  const collection = req.role.collections.get(collectionName)

  if (collection === undefined) {
    res
      .code(403)
      .send(new Error($t('You do not have access to this resource', req.lang)))
    return true
  }

  if (collection[accessType]) return false

  if (collection.author) {
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
