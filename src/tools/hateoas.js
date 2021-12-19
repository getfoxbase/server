import qs from 'qs'

function buildUrlWithUpdates (request, updates = {}) {
  return qs.stringify({
    ...request.query,
    ...updates
  })
}

export default (list, request) => {
  list._links = {
    self: `${request.protocol}://${request.hostname}/api/${
      request.params.collectionName
    }?${buildUrlWithUpdates(request.query)}`,
    next: list.nextPage
      ? `${request.protocol}://${request.hostname}/api/${
          request.params.collectionName
        }?${buildUrlWithUpdates(request.query, {
          page: list.nextPage
        })}`
      : null,
    prev: list.prevPage
      ? `${request.protocol}://${request.hostname}/api/${
          request.params.collectionName
        }?${buildUrlWithUpdates(request.query, {
          page: list.prevPage
        })}`
      : null,
    first: `${request.protocol}://${request.hostname}/api/${
      request.params.collectionName
    }?${buildUrlWithUpdates(request.query, {
      page: 1
    })}`,
    last: `${request.protocol}://${request.hostname}/api/${
      request.params.collectionName
    }?${buildUrlWithUpdates(request.query, {
      page: list.totalPages
    })}`
  }

  return list
}
