async function auth(request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
}

module.exports = auth
 