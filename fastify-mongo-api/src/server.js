require('dotenv').config()

const fastify = require('fastify')({ logger: true })
const connectDB = require('./db')

// Swagger
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

// JWT
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET
})

// Routes
const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')

const PORT = 6010

const startServer = async () => {
  try {
    await connectDB()

    // Swagger config with Bearer auth
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'Fastify Mongo API',
          description: 'API documentation for User service',
          version: '1.0.0'
        },
        securityDefinitions: {
          BearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'Enter: Bearer <token>'
          }
        }
      }
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs'
    })

    // Register routes
    fastify.register(authRoutes)
    fastify.register(userRoutes)

    await fastify.listen({ port: PORT, host: '127.0.0.1' })

    console.log(`🚀 Server running at http://localhost:${PORT}`)
    console.log(`📘 Swagger docs at http://localhost:${PORT}/docs`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

startServer()
