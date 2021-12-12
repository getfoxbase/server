export default {
  body: {
    type: 'object',
    required: ['code'],
    additionalProperties: false,
    properties: {
      code: { type: 'string', format: 'uuid' },
      update: {
        type: 'object',
        additionalProperties: false,
        properties: {
          firstname: { type: 'string', minLength: 1 },
          lastname: { type: 'string', minLength: 1 },
          email: { type: 'string', minLength: 1, format: 'email' }
        }
      }
    }
  }
}
