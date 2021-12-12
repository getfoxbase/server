import mongoose from 'mongoose'
import fastifyIo from 'fastify-socket.io'
import fastifyCors from 'fastify-cors'
import fastifyFileUpload from 'fastify-file-upload'
import qs from 'qs'

// Load environment variables from .env file
require('dotenv').config()

// Create fastify instance
const app = require('fastify')({
  logger: process.env.DEBUG === 'true',
  querystringParser: str => qs.parse(str)
})

app.register(fastifyCors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})

app.register(fastifyFileUpload)

// Setup routes
// Setup sockets

const start = async _ => {
  try {
    await mongoose.connect(process.env.MONGO_DSN)
    mongoose.model('user', {
      email: String
    })
    mongoose.deleteModel('user')
    mongoose.model('user', {
      email: String
    })

    await app.ready()

    await app.listen(process.env.PORT ?? 80)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
