export default async (request, reply) => {
  if (!reply.sent)
    reply.code(404).send({
      message: `Route yay ${request.method}:${request.url} not found`,
      error: 'Not Found',
      statusCode: 404
    })
}
