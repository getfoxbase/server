import Collection from '../models/Collection'
import buildQuery from '../tools/query'
import { $t } from '../tools/i18n'

export default class Collections {
  static async list (request, reply) {
    if (this.checkAccess(request, reply, request.params.collectionName, 'read'))
      return

    try {
      const model = await Collection.get(request.params.collectionName)
      if (!model) {
        reply.code(404).send(
          new Error(
            $t('{{name}} collection does not exists', request.lang, {
              name: request.params.collectionName
            })
          )
        )
        return
      }

      const { page, limit, query, sort } = buildQuery(request, model)
      const list = await model.paginate(query, {
        page,
        limit,
        sort
      })

      list.docs = list.docs.map(doc => doc.export())

      reply.send(list)
    } catch (err) {
      throw err
    }
  }

  static async create (request, reply) {
    if (
      this.checkAccess(request, reply, request.params.collectionName, 'write')
    )
      return

    const model = await Collection.get(request.params.collectionName)
    if (!model) {
      reply.code(404).send(
        new Error(
          $t('"{name}" collection does not exists', request.lang, {
            name: request.params.collectionName
          })
        )
      )
      return
    }

    const doc = await model.create(request.body)

    reply.code(201)
    return doc.export()
  }

  static async get (request, reply) {
    try {
      const model = await Collection.get(request.params.collectionName)
      if (!model) {
        reply.code(404).send(
          new Error(
            $t('"{name}" collection does not exists', request.lang, {
              name: request.params.collectionName
            })
          )
        )
        return
      }

      const doc = await model.findById(request.params.docId).exec()
      if (!doc) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
      } else if (
        this.checkAccess(
          request,
          reply,
          request.params.collectionName,
          'read',
          doc
        )
      )
        return
      else {
        reply.send(doc.export())
      }
    } catch (err) {
      throw err
    }
  }

  static async update (request, reply) {
    try {
      const model = await Collection.get(request.params.collectionName)
      if (!model) {
        reply.code(404).send(
          new Error(
            $t('"{name}" collection does not exists', request.lang, {
              name: request.params.collectionName
            })
          )
        )
        return
      }

      const doc = await model.findById(request.params.docId)
      if (!doc) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      if (
        this.checkAccess(
          request,
          reply,
          request.params.collectionName,
          'write',
          doc
        )
      )
        return

      doc.applyValues(request.body, request, false)
      await doc.save()

      reply.send(doc.export())
    } catch (err) {
      throw err
    }
  }

  static async replace (request, reply) {
    try {
      const model = await Collection.get(request.params.collectionName)
      if (!model) {
        reply.code(404).send(
          new Error(
            $t('"{name}" collection does not exists', request.lang, {
              name: request.params.collectionName
            })
          )
        )
        return
      }

      const doc = await model.findById(request.params.docId)
      if (!doc) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      if (
        this.checkAccess(
          request,
          reply,
          request.params.collectionName,
          'write',
          doc
        )
      )
        return

      doc.applyValues(request.body, request, true)
      await doc.save()

      reply.send(doc.export())
    } catch (err) {
      throw err
    }
  }

  static async delete (request, reply) {
    try {
      const model = await Collection.get(request.params.collectionName)
      if (!model) {
        reply.code(404).send(
          new Error(
            $t('"{name}" collection does not exists', request.lang, {
              name: request.params.collectionName
            })
          )
        )
        return
      }

      const doc = await model.findById(request.params.docId)
      if (!doc) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      if (
        this.checkAccess(
          request,
          reply,
          request.params.collectionName,
          'delete',
          doc
        )
      )
        return

      await doc.delete(request.user?._id)

      reply.code(204).send({
        deleted: true
      })
    } catch (err) {
      throw err
    }
  }

  static async listRelation (request, reply) {
    return 'ok'
  }
  static async createRelation (request, reply) {
    return 'ok'
  }
  static async getRelation (request, reply) {
    return 'ok'
  }
  static async deleteRelation (request, reply) {
    return 'ok'
  }
}
