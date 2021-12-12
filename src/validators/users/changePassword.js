export default {
  body: {
    type: 'object',
    additionalProperties: false,
    required: ['code', 'password'],
    properties: {
      code: { type: 'string', format: 'uuid' },
      password: { type: 'string', minLength: 1 }
    }
  }
}
