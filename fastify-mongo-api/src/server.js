require('dotenv').config()

const fastify = require('fastify')({ logger: true })
const connectDB = require('./db')
const userRoutes = require('./routes/user.routes')

// Swagger plugins
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

// ✅ change port here
const PORT = 6010

const startServer = async () => {
  try {
    // Connect to DB
    await connectDB()

    // Swagger setup (clean & modern)
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'Fastify Mongo API',
          description: 'API documentation for User service',
          version: '1.0.0'
        }
      }
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs'
    })

    // Register routes
    fastify.register(userRoutes)

    // Start server
    await fastify.listen({ port: PORT, host: '127.0.0.1' })

    console.log(`🚀 Server running at http://localhost:${PORT}`)
    console.log(`📘 Swagger docs at http://localhost:${PORT}/docs`)

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// ✅ correct function call
startServer()
