async function credentialsRoutes(fastify) {
  /*
   * --------------------------------------------------------------------------
   * 1. Set Cookie
   * --------------------------------------------------------------------------
   *
   * The browser receives:
   *
   * Set-Cookie: wci-session=test-value
   *
   * Because the frontend request uses:
   *
   * credentials: "include"
   *
   * the browser is allowed to store the cookie.
   */

  fastify.get(
    '/credentials/set-cookie',
    async (_request, reply) => {
      reply.header(
        'Set-Cookie',
        'wci-session=test-value; Path=/; SameSite=Lax'
      )

      return {
        success: true,
        message: 'Cookie set'
      }
    }
  )

  /*
   * --------------------------------------------------------------------------
   * 2. Read Cookie
   * --------------------------------------------------------------------------
   *
   * On the second request the browser should send:
   *
   * Cookie: wci-session=test-value
   */

  fastify.get(
    '/credentials/read-cookie',
    async (request) => {
      return {
        success: true,

        cookie:
          request.headers.cookie ?? null
      }
    }
  )
}

module.exports = credentialsRoutes