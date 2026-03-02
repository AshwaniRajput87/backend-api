const forced401Attempts = new Map()
const concurrent401Attempts = new Map()

async function auth0Routes(fastify) {
  /*
   * ----------------------------------------------------------------------
   * 1. Public route
   * ----------------------------------------------------------------------
   */
  fastify.get('/auth0/public', async () => {
    return {
      success: true,
      message: 'Public Auth0 route is working'
    }
  })

  /*
   * ----------------------------------------------------------------------
   * 2. Normal protected route
   * ----------------------------------------------------------------------
   */
  fastify.get(
    '/auth0/private',
    {
      preHandler: fastify.requireAuth()
    },
    async (request) => {
      return {
        success: true,
        message: 'Auth0 authentication successful',
        user: request.user
      }
    }
  )

  /*
   * ----------------------------------------------------------------------
   * 3. Profile route
   * ----------------------------------------------------------------------
   */
  fastify.get(
    '/auth0/profile',
    {
      preHandler: fastify.requireAuth()
    },
    async (request) => {
      return {
        success: true,
        profile: request.user
      }
    }
  )

  /*
   * ----------------------------------------------------------------------
   * 4. Force one 401, then succeed
   * ----------------------------------------------------------------------
   *
   * Used to prove:
   *
   * request
   * → 401
   * → WCI refreshAccessToken()
   * → replay once
   * → 200
   *
   * The Auth0 token is still validated first.
   */
  fastify.get(
    '/auth0/test/force-401-once/:key',
    {
      preHandler: fastify.requireAuth()
    },
    async (request, reply) => {
      const { key } = request.params

      const previousAttempts =
        forced401Attempts.get(key) ?? 0

      const attempt =
        previousAttempts + 1

      forced401Attempts.set(
        key,
        attempt
      )

      if (attempt === 1) {
        reply.code(401)

        return {
          success: false,
          attempt,
          message:
            'Intentional 401 for WCI auth refresh test'
        }
      }

      forced401Attempts.delete(key)

      return {
        success: true,
        attempt,
        message:
          'Request succeeded after WCI auth replay',
        user: request.user
      }
    }
  )

  /*
   * ----------------------------------------------------------------------
   * 5. Always return 401
   * ----------------------------------------------------------------------
   *
   * Used to prove WCI does NOT create an infinite refresh loop.
   */
  fastify.get(
    '/auth0/test/always-401',
    {
      preHandler: fastify.requireAuth()
    },
    async (_request, reply) => {
      reply.code(401)

      return {
        success: false,
        message:
          'Intentional permanent 401'
      }
    }
  )

  /*
   * ----------------------------------------------------------------------
   * 6. Concurrent 401 test
   * ----------------------------------------------------------------------
   *
   * Each unique request key fails once.
   *
   * Calling three different keys simultaneously causes:
   *
   * A → 401
   * B → 401
   * C → 401
   *
   * WCI AuthCoordinator should coordinate them into ONE token refresh.
   */
  fastify.get(
    '/auth0/test/concurrent-401/:key',
    {
      preHandler: fastify.requireAuth()
    },
    async (request, reply) => {
      const { key } = request.params

      const previousAttempts =
        concurrent401Attempts.get(key) ?? 0

      const attempt =
        previousAttempts + 1

      concurrent401Attempts.set(
        key,
        attempt
      )

      if (attempt === 1) {
        reply.code(401)

        return {
          success: false,
          key,
          attempt,
          message:
            'Intentional concurrent 401'
        }
      }

      concurrent401Attempts.delete(key)

      return {
        success: true,
        key,
        attempt,
        message:
          'Concurrent request succeeded after replay'
      }
    }
  )
}

module.exports = auth0Routes