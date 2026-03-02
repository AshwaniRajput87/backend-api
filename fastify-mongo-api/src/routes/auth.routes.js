async function authRoutes(fastify) {

  const loginSchema = {
    tags: ['Auth'],
    summary: 'Login and generate JWT token',
    body: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        }
      }
    }
  }

  fastify.post(
    '/login',
    { schema: loginSchema },
    async (request) => {
      const { userId } = request.body
      const token = fastify.jwt.sign({ userId })
      return { token }
    }
  )
}

module.exports = authRoutes
