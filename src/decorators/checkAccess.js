import { $t } from '../tools/i18n'

export default (
  request,
  reply,
  collectionName,
  accessType,
  document = null
) => {
  if (request.role.allAccess) return false

  const collection = request.role.collections.get(collectionName)

  if (collection === undefined) {
    reply
      .code(403)
      .send(
        new Error($t('You do not have access to this resource', request.lang))
      )
    return true
  }

  if (collection[accessType]) return false

  if (collection.author) {
    request.limitToAuthor = true
    if (
      document !== null &&
      (request.user === null || document._author.toString() !== request.user.id)
    ) {
      reply
        .code(403)
        .send(
          new Error($t('You do not have access to this resource', request.lang))
        )
      return true
    }

    return false
  }

  return false
}
