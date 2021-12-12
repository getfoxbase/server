export default {
  body: {
    type: 'object',
    required: ['email', 'firstname', 'lastname', 'password'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', minLength: 1, format: 'email' },
      firstname: { type: 'string', minLength: 1 },
      lastname: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 6 }
    }
  }
}
