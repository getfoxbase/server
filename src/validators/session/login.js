export default {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', minLength: 1, format: 'email' },
      password: { type: 'string', minLength: 6 },
      askLongToken: { type: 'boolean' }
    }
  }
}
