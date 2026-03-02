const User = require('../models/user.model')
const auth = require('../middleware/auth')

const secure = {
  security: [{ BearerAuth: [] }]
}

async function userRoutes(fastify) {

  // CREATE
  fastify.post(
    '/users',
    {
      preHandler: auth,
      schema: {
        ...secure,
        tags: ['Users'],
        summary: 'Create user',
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            age: { type: 'number' }
          }
        }
      }
    },
    async (request) => {
      return User.create({
        ...request.body,
        ownerId: request.user.userId
      })
    }
  )

  // GET OWN USERS
  fastify.get(
    '/users/me',
    {
      preHandler: auth,
      schema: {
        ...secure,
        tags: ['Users'],
        summary: 'Get my users'
      }
    },
    async (request) => {
      return User.find({ ownerId: request.user.userId })
    }
  )

  // UPDATE
  fastify.put(
    '/users/:id',
    {
      preHandler: auth,
      schema: {
        ...secure,
        tags: ['Users'],
        summary: 'Update user'
      }
    },
    async (request) => {
      return User.findOneAndUpdate(
        { _id: request.params.id, ownerId: request.user.userId },
        request.body,
        { new: true }
      )
    }
  )

  // DELETE
  fastify.delete(
    '/users/:id',
    {
      preHandler: auth,
      schema: {
        ...secure,
        tags: ['Users'],
        summary: 'Delete user'
      }
    },
    async (request) => {
      await User.findOneAndDelete({
        _id: request.params.id,
        ownerId: request.user.userId
      })
      return { message: 'User deleted' }
    }
  )
}

module.exports = userRoutes
