require('dotenv').config()
const fastify = require('fastify')({ logger: true })

const connectDB = require('./db')
const userRoutes = require('./routes/user.routes')

// Swagger plugins
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')

const startServer = async () => {
  try {
    // DB connection
    await connectDB()

    // Swagger setup
    await fastify.register(swagger, {
      swagger: {
        info: {
          title: 'Fastify Mongo API',
          description: 'API documentation for User service',
          version: '1.0.0'
        },
        host: 'localhost:3000',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
      }
    })

    await fastify.register(swaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      }
    })

    // Register routes
    fastify.register(userRoutes)

    // Start server
    await fastify.listen({ port: 3000 })
    console.log('🚀 Server running at http://localhost:3000')
    console.log('📘 Swagger docs at http://localhost:3000/docs')

  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

startServer()
