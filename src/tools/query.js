import LatLng from '../types/LatLng'

function parseFields (fields) {
  const words = []
  let subs = []
  let currentWord = ''
  let opened = 0

  for (let i = 0; i < fields.length; i++) {
    if (fields[i] === ')') {
      if (currentWord.length) {
        words.push({ field: currentWord, sub: [] })
        currentWord = ''
      }
      return words
    } else if (fields[i] === '(') {
      subs = parseFields(fields.substr(i + 1))
      if (currentWord.length) {
        words.push({ field: currentWord, sub: subs })
      } else {
        for (let sub of subs) {
          words.push(sub)
        }
      }
      currentWord = ''
      opened = 1
      for (let j = i + 1; j < fields.length; j++) {
        if (fields[j] === '(') opened++
        else if (fields[j] === ')') {
          opened--
          if (opened === 0) {
            i = j + 1
          }
        }
      }
      if (opened) i = fields.length
    } else if (fields[i] === ',') {
      if (currentWord.length) {
        words.push({ field: currentWord, sub: [] })
        currentWord = ''
      }
    } else {
      currentWord += fields[i]
    }
  }

  if (currentWord.length) {
    words.push({ field: currentWord, sub: [] })
    currentWord = ''
  }
  return words
}

export default function (request, collection = null) {
  let page = 1
  let limit = 20
  let query = []
  let search = null
  let sort = undefined
  let geoField = null
  let geoFields = collection ? collection.getGeoFields() : []
  const searchFields = collection ? collection.getSearchFields() : []
  let filter = null
  let o = {}

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
      case 'fields':
        filter = parseFields(val[0])
        break
      case 'search':
        if (search === null) search = []
        for (const searchQuery of val) {
          for (const searchField of searchFields) {
            o = {}
            o[searchField] = {
              $regex: searchQuery,
              $options: 'i'
            }
            search.push(o)
          }
        }
        break
      case 'geoNear':
        if (!collection || !collection.canBeGeoSearched())
          throw new Error('This collection cannot be geo searched.')

        val = val[0]

        geoField = null
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

        if (geoFields.includes(geoField) === false)
          throw new Error(`"${key[2]}" is not a valid latlng field.`)

        o = {}
        o[geoField] = {
          $nearSphere: {
            $geometry: LatLng.in(val),
            $minDistance: min,
            $maxDistance: max
          }
        }
        query.push(o)
        break
      case 'geoWithin':
        if (!collection || !collection.canBeGeoSearched())
          throw new Error('This collection cannot be geo searched.')

        val = val[0]

        geoField = null
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

        o = {}
        o[geoField] = {
          $geoWithin: {
            $geometry: {
              type: 'Polygon',
              coordinates: [val]
            }
          }
        }
        query.push(o)
        break
      default:
        for (const currentVal of val) {
          currentVal = collection.formatIn(key[1], currentVal, request)
          if (currentVal === null) break
          switch (key[2] ?? 'eq') {
            case 'eq':
            case 'ne':
            case 'gt':
            case 'gte':
            case 'lt':
            case 'lte':
              o = {}
              o[key[1]] = {}
              o[key[1]][`$${key[2]}`] = currentVal
              query.push(o)
              break
            case 'in':
              o = {}
              o[key[1]] = {
                $in: currentVal.split(',')
              }
              query.push(o)
              break
            case 'contains':
              o = {}
              o[key[1]] = {
                $regex: currentVal,
                $options: 'i'
              }
              query.push(o)
              break
            default:
              throw new Error(`Unknown operator "${key[2]}"`)
          }
        }
        break
    }
  }

  if (query.length === 0) {
    query = {}
  } else if (query.length === 1) {
    query = query[0]
  } else {
    query = {
      $and: query
    }
  }

  if (search !== null) {
    if (search.length > 1)
      search = {
        $or: search
      }
    else {
      search = search[0]
    }
    if (Object.keys(query).length) {
      query = {
        $and: [query, search]
      }
    } else {
      query = search
    }
  }

  return { page, limit, query, sort, filter }
}
