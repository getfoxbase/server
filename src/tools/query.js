import LatLng from '../types/LatLng'

export default function (request, collection) {
  let page = 1
  let limit = 20
  let query = {}
  let search = null
  let sort = undefined

  for (let key in request.query) {
    let val = request.query[key]
    if (val instanceof Array === false) val = [val]
    key = /^([a-z_0-9]+)\(?([a-z_0-9;=\.]+)?\)?$/i.exec(key)

    switch (key[1]) {
      case 'page':
        page = +val[0]
        break
      case 'limit':
        limit = +val[0]
        break
      case 'sort':
        sort = val[0]
        break
      case 'search':
        if (search === null) search = []
        for (const searchQuery of val) {
          for (const searchField of collection.getSearchFields()) {
            let o = {}
            o[searchField] = {
              $regex: searchQuery,
              $options: 'i'
            }
            search.push(o)
          }
        }
        break
      case 'geoNear':
        if (!collection.canBeGeoSearched())
          throw new Error('This collection cannot be geo searched.')

        val = val[0]

        let geoField = null
        let min = 0
        let max = 20000

        ;(key[2] ?? '').split(';').forEach(geoConf => {
          const [confKey, confVal] = geoConf.split('=')
          switch (confKey) {
            case 'field':
              geoField = confVal
              break
            case 'min':
              min = +confVal
              break
            case 'max':
              max = +confVal
              break
          }
        })

        let geoFields = collection.getGeoFields()
        if (geoFields.includes(geoField) === false)
          throw new Error(`"${key[2]}" is not a valid latlng field.`)

        query[geoField] = {
          $nearSphere: {
            $geometry: LatLng.in(val),
            $minDistance: min,
            $maxDistance: max
          }
        }
        break
      case 'geoWithin':
        if (!collection.canBeGeoSearched())
          throw new Error('This collection cannot be geo searched.')

        val = val[0]

        let geoField = null
        let type = 'polygon'

        ;(key[2] ?? '').split(';').forEach(geoConf => {
          const [confKey, confVal] = geoConf.split('=')
          switch (confKey) {
            case 'field':
              geoField = confVal
              break
            case 'type':
              type = confVal
              break
          }
        })

        let geoFields = collection.getGeoFields()
        if (geoFields.includes(geoField) === false)
          throw new Error(`"${key[2]}" is not a valid latlng field.`)

        const points = val.split(',').map(v => parseFloat(v))
        val = []
        for (let i = 0; i < points.length; i = i + 2) {
          val.push([points[1], points[0]])
        }

        switch (type) {
          case 'polygon':
            break
          case 'bounds':
            const geoE = val[0][0]
            const geoN = val[0][1]
            const geoW = val[1][0]
            const geoS = val[1][1]
            val = [
              [geoE, geoN],
              [geoW, geoN],
              [geoW, geoS],
              [geoE, geoS],
              [geoE, geoN]
            ]
            break
          default:
            throw new Error(`"${type}" geo type search is not supported.`)
        }

        query[geoField] = {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [val]
            }
          }
        }
        break
      default:
        val = collection.formatIn(key[1], val)
        if (val === null) break
        switch (key[2]) {
          case 'ne':
          case 'gt':
          case 'gte':
          case 'lt':
          case 'lte':
            const o = {}
            o[`$${key[2]}`] = val
            query[key[1]] = o
            break
          case 'eq':
          default:
            query[key[1]] = val
            break
        }
        break
    }
  }

  if (search !== null) {
    if (search.length > 1)
      search = {
        $or: search
      }
    else search = search[0]
    if (Object.keys(query).length) {
      query = {
        $and: [query, search]
      }
    } else {
      query = search
    }
  }

  return { page, limit, query, sort }
}
