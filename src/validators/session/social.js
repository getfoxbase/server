import providers from '@/conf/providers'

export default {
  params: {
    type: 'object',
    properties: {
      driver: { type: 'string', enum: Object.keys(providers) }
    }
  }
}
