import langs from '@/conf/langs'

export default {
  params: {
    type: 'object',
    required: ['userId'],
    additionalProperties: false,
    properties: {
      userId: { type: 'string', pattern: '^[a-f\\d]{24}$' }
    }
  },
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 1 },
      firstname: { type: 'string', minLength: 1 },
      lastname: { type: 'string', minLength: 1 },
      avatar: { type: 'string', format: 'uri' },
      lang: { type: 'string', enum: Object.keys(langs) },
      role: { type: 'string' }
    }
  }
}
