import Collection from '../models/Collection'
import buildQuery from '../tools/query'
import { $t } from '../tools/i18n'
import applyHateoas from '../tools/hateoas'

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

      const { page, limit, query, sort, filter } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )
      const list = await model.paginate(query, {
        page,
        limit,
        sort
      })

      const docs = []
      for (let doc of list.docs) docs.push(await doc.export(request, filter))
      list.docs = docs

      reply.send(applyHateoas(list, request))
    } catch (err) {
      throw err
    }
  }

  static async first (request, reply) {
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

      const { query, filter } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )
      const list = await model
        .find(query, {
          page: 1,
          limit: 1,
          sort: '_id'
        })
        .exec()

      if (list.length === 0) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      reply.send(await list[0].export(request, filter))
    } catch (err) {
      throw err
    }
  }

  static async last (request, reply) {
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

      const { query, filter } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )
      const list = await model
        .find(query, {
          page: 1,
          limit: 1,
          sort: '-_id'
        })
        .exec()

      if (list.length === 0) {
        reply.code(404).send(new Error($t('Resource not found', request.lang)))
        return
      }

      reply.send(await list[0].export(request, filter))
    } catch (err) {
      throw err
    }
  }

  static async count (request, reply) {
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

      const { query } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )
      const count = await model.count(query)

      reply.send({ count })
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

    const doc = new model()
    await doc.applyValues(request.body, request)
    await doc.save()

    reply.code(201)
    return await doc.export(request)
  }

  static async createBulk (request, reply) {
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

    const statuses = []
    const docs = []
    let doc = null

    for (let body in request.body) {
      try {
        doc = new model()
        await doc.applyValues(body, request)
        await doc.save()
        docs.push(doc.export(request))
        statuses.push(true)
      } catch (err) {
        statuses.push(false)
      }
    }

    reply.code(statuses.find(a => !a) ? 409 : 201)
    return docs
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

      const { filter } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )
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
        reply.send(await doc.export(request, filter))
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

      await doc.applyValues(request.body, request, false)
      await doc.save()

      reply.send(await doc.export(request))
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

      await doc.applyValues(request.body, request, true)
      await doc.save()

      reply.send(await doc.export(request))
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

      const { page, limit, query, sort, filter } = await buildQuery(
        request,
        model,
        request.limitToAuthor
          ? {
              _author: request.user._id
            }
          : null
      )

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
          'read',
          doc
        )
      )
        return
      const conf = model.getConfiguration()
      let rel = null
      switch (conf.fields[request.params.relationName]?.type) {
        case 'one-to-one':
          await this.populate(request.params.relationName)
          rel = doc.get('request.params.relationName')
          if (!rel) {
            reply
              .code(404)
              .send(new Error($t('Resource not found', request.lang)))
          } else {
            reply.send(await rel.export(request, filter))
          }
          break
        case 'one-to-many':
          await this.populate([
            {
              path: request.params.relationName,
              options: {
                sort
              },
              match: query
            }
          ])
          rel = doc.get('request.params.relationName')
          const docs = []
          for (const r of rel) {
            docs.push(await r.export(request, filter))
          }
          const totalPages = Math.ceil(docs.length / limit)
          const list = {
            docs: docs.slice((page - 1) * limit, page * limit),
            totalDocs: docs.length,
            limit,
            page,
            totalPages,
            hasNextPage: page < totalPages,
            nextPage: page < totalPages ? page + 1 : null,
            hasPrevPage: page > 1,
            prevPage: page > 1 ? page - 1 : null,
            pagingCounter: (page - 1) * limit + 1
          }

          reply.send(applyHateoas(list, request))
          break
        default:
          reply
            .code(404)
            .send(new Error($t('Relation not found', request.lang)))
          return
      }
    } catch (err) {
      throw err
    }
  }
}
