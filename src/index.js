import mongoose from 'mongoose'
import qs from 'qs'
import Role from './models/Role'
import setupRoutes from './routes'
import { setupSocket } from './socket'

// Load environment variables from .env file
require('dotenv').config()

// Create fastify instance
const app = require('fastify')({
  logger: process.env.DEBUG === 'true',
  querystringParser: str => qs.parse(str)
})

// Register Socket.IO
app.register(require('fastify-socket.io'), {
  cors: {
    origin: process.env.RESTRICT_DOMAIN || true,
    methods: ['GET', 'POST']
  }
})

// Setup cross origin restrictions
app.register(require('fastify-cors'), {
  origin: process.env.RESTRICT_DOMAIN || true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})

// Setup file uploading
app.register(require('fastify-file-upload'))

const start = async _ => {
  try {
    await mongoose.connect(process.env.MONGO_DSN)

    // Ensure basic roles
    await Role.ensureBasicRoles()

    // Setup routes
    await setupRoutes(app)

    // Setup sockets
    setupSocket(app)
    await app.ready()
    await app.listen(process.env.PORT ?? 80)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
