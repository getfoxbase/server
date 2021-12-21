export default (request, reply) => {
  reply.code(404)

  return {
    message: `Route yay ${request.method}:${request.url} not found`,
    error: 'Not Found',
    statusCode: 404
  }
}
