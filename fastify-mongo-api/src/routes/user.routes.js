const User = require('../models/user.model')

/* -------------------- SCHEMAS -------------------- */

// POST /users
const createUserSchema = {
  tags: ['Users'],
  summary: 'Create a new user',
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number' }
      }
    }
  }
}

// GET /users
const getUsersSchema = {
  tags: ['Users'],
  summary: 'Get all users'
}

// PUT /users/:id
const putUserSchema = {
  tags: ['Users'],
  summary: 'Replace user (full update)',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
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

// PATCH /users/:id
const patchUserSchema = {
  tags: ['Users'],
  summary: 'Update user partially',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  },
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      age: { type: 'number' }
    }
  }
}

// DELETE /users/:id
const deleteUserSchema = {
  tags: ['Users'],
  summary: 'Delete user',
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' }
    }
  }
}

// OPTIONS /users
const optionsSchema = {
  tags: ['Users'],
  summary: 'Get allowed HTTP methods'
}

// TRACE /users/trace
const traceSchema = {
  tags: ['Users'],
  summary: 'Trace request headers'
}

/* -------------------- ROUTES -------------------- */

async function userRoutes(fastify) {

  // 1️⃣ POST
  fastify.post(
    '/users',
    { schema: createUserSchema },
    async (request) => {
      return await User.create(request.body)
    }
  )

  // 2️⃣ GET
  fastify.get(
    '/users',
    { schema: getUsersSchema },
    async () => {
      return await User.find()
    }
  )

  // 3️⃣ PUT
  fastify.put(
    '/users/:id',
    { schema: putUserSchema },
    async (request) => {
      return await User.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true, overwrite: true }
      )
    }
  )

  // 4️⃣ PATCH
  fastify.patch(
    '/users/:id',
    { schema: patchUserSchema },
    async (request) => {
      return await User.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true }
      )
    }
  )

  // 5️⃣ DELETE
  fastify.delete(
    '/users/:id',
    { schema: deleteUserSchema },
    async (request) => {
      await User.findByIdAndDelete(request.params.id)
      return { message: 'User deleted successfully' }
    }
  )

  // 6️⃣ OPTIONS
  fastify.options(
    '/users',
    { schema: optionsSchema },
    async () => {
      return {
        allowedMethods: [
          'GET',
          'POST',
          'PUT',
          'PATCH',
          'DELETE',
          'OPTIONS',
          'TRACE'
        ]
      }
    }
  )

  // 7️⃣ TRACE
  fastify.trace(
    '/users/trace',
    { schema: traceSchema },
    async (request) => {
      return {
        method: request.method,
        headers: request.headers
      }
    }
  )
}

module.exports = userRoutes
