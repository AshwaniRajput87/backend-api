require('dotenv').config()

const fastify = require('fastify')({
  logger: true
})

/* -------------------------------------------------------------------------- */
/* Plugins                                                                    */
/* -------------------------------------------------------------------------- */

const cors = require('@fastify/cors')
const multipart = require('@fastify/multipart')
const swagger = require('@fastify/swagger')
const swaggerUI = require('@fastify/swagger-ui')
const fastifyAuth0Api = require('@auth0/auth0-fastify-api')

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

const connectDB = require('./db')

/* -------------------------------------------------------------------------- */
/* Routes                                                                     */
/* -------------------------------------------------------------------------- */

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const demoRoutes = require('./routes/demo.routes')
const auth0Routes = require('./routes/auth0.routes')
const uploadRoutes = require('./routes/upload.routes')
const credentialsRoutes = require('./routes/credentials.routes')

const PORT = process.env.PORT || 3000

/* -------------------------------------------------------------------------- */
/* Existing custom JWT                                                        */
/* -------------------------------------------------------------------------- */

fastify.register(
  require('@fastify/jwt'),
  {
    secret: process.env.JWT_SECRET
  }
)

/* -------------------------------------------------------------------------- */
/* Form body parser                                                           */
/* -------------------------------------------------------------------------- */

fastify.register(
  require('@fastify/formbody')
)

/* -------------------------------------------------------------------------- */
/* Custom JSON parser                                                         */
/* -------------------------------------------------------------------------- */

fastify.addContentTypeParser(
  /^application\/json.*$/i,
  {
    parseAs: 'string'
  },
  (_request, body, done) => {
    try {
      done(
        null,
        body
          ? JSON.parse(body)
          : {}
      )
    } catch (error) {
      done(
        error,
        undefined
      )
    }
  }
)

/* -------------------------------------------------------------------------- */
/* Raw binary parser                                                          */
/* -------------------------------------------------------------------------- */
/*
 * Required for:
 *
 * Content-Type:
 * application/octet-stream
 *
 * Used by:
 *
 * POST /upload/raw
 *
 * Fastify will parse the incoming binary body
 * into a Node Buffer and expose it as:
 *
 * request.body
 */

fastify.addContentTypeParser(
  'application/octet-stream',
  {
    parseAs: 'buffer'
  },
  (_request, body, done) => {
    done(
      null,
      body
    )
  }
)

/* -------------------------------------------------------------------------- */
/* Start server                                                               */
/* -------------------------------------------------------------------------- */

const startServer = async () => {
  try {
    /* ---------------------------------------------------------------------- */
    /* Validate environment variables                                         */
    /* ---------------------------------------------------------------------- */

    if (!process.env.JWT_SECRET) {
      throw new Error(
        'JWT_SECRET is missing from environment variables'
      )
    }

    if (!process.env.AUTH0_DOMAIN) {
      throw new Error(
        'AUTH0_DOMAIN is missing from environment variables'
      )
    }

    if (!process.env.AUTH0_AUDIENCE) {
      throw new Error(
        'AUTH0_AUDIENCE is missing from environment variables'
      )
    }

    /* ---------------------------------------------------------------------- */
    /* MongoDB                                                                */
    /* ---------------------------------------------------------------------- */

    await connectDB()

    /* ---------------------------------------------------------------------- */
    /* CORS                                                                   */
    /* ---------------------------------------------------------------------- */

   await fastify.register(
  cors,
  {
    origin:
      "http://localhost:5173",

    credentials:
      true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "HEAD",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-XSRF-TOKEN",
    ],
  },
);

    /* ---------------------------------------------------------------------- */
    /* Multipart / FormData                                                   */
    /* ---------------------------------------------------------------------- */

    await fastify.register(
      multipart,
      {
        limits: {
          files: 5,

          fields: 20,

          fileSize:
            5 * 1024 * 1024
        }
      }
    )

    /* ---------------------------------------------------------------------- */
    /* Swagger                                                                */
    /* ---------------------------------------------------------------------- */

    await fastify.register(
      swagger,
      {
        swagger: {
          info: {
            title:
              'Fastify Mongo API',

            description:
              'API documentation for User service',

            version:
              '1.0.0'
          },

          securityDefinitions: {
            BearerAuth: {
              type:
                'apiKey',

              name:
                'Authorization',

              in:
                'header',

              description:
                'Enter: Bearer <token>'
            }
          }
        }
      }
    )

    await fastify.register(
      swaggerUI,
      {
        routePrefix:
          '/docs'
      }
    )

    /* ---------------------------------------------------------------------- */
    /* Auth0                                                                  */
    /* ---------------------------------------------------------------------- */

    await fastify.register(
      fastifyAuth0Api,
      {
        domain:
          process.env.AUTH0_DOMAIN,

        audience:
          process.env.AUTH0_AUDIENCE
      }
    )

    /* ---------------------------------------------------------------------- */
    /* Routes                                                                 */
    /* ---------------------------------------------------------------------- */

    await fastify.register(
      authRoutes
    )

    await fastify.register(
      userRoutes
    )

    await fastify.register(
      demoRoutes
    )

    await fastify.register(
      auth0Routes
    )

    await fastify.register(
      uploadRoutes
    )

    await fastify.register(
      credentialsRoutes
    )

    /* ---------------------------------------------------------------------- */
    /* Start                                                                  */
    /* ---------------------------------------------------------------------- */

    await fastify.listen({
      port: PORT,
      host: '127.0.0.1'
    })

    console.log(
      `🚀 Server running at http://localhost:${PORT}`
    )

    console.log(
      `📘 Swagger docs at http://localhost:${PORT}/docs`
    )

    console.log(
      `🔓 Auth0 public route: http://localhost:${PORT}/auth0/public`
    )

    console.log(
      `🔐 Auth0 private route: http://localhost:${PORT}/auth0/private`
    )

    console.log(
      `📤 Upload routes enabled`
    )

    console.log(
      `📦 Raw binary uploads enabled: http://localhost:${PORT}/upload/raw`
    )
  } catch (error) {
    fastify.log.error(
      error
    )

    process.exit(1)
  }
}

startServer()