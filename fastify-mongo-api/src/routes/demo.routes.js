const db = require('../demo-data');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function demoRoutes(fastify) {
  // Posts
  fastify.get('/posts', async () => db.posts);

  fastify.get('/posts/:id', async (request, reply) => {
    const post = db.posts.find((p) => p.id == request.params.id);
    if (!post) {
      reply.code(404);
      return { error: 'Post not found' };
    }
    if (request.headers['accept']?.includes('text/plain')) {
      reply.type('text/plain');
      return JSON.stringify(post);
    }
    return post;
  });

  fastify.post('/posts', async (request, reply) => {
    const { title, body, userId } = request.body || {};
    const newPost = {
      id: db.posts.length + 1,
      userId,
      title,
      body,
    };
    db.posts.push(newPost);
    reply.code(201);
    return newPost;
  });

  fastify.patch('/posts/:id', async (request, reply) => {
    const post = db.posts.find((p) => p.id == request.params.id);
    if (!post) {
      reply.code(404);
      return { error: 'Post not found' };
    }
    if (request.body?.title) {
      post.title = request.body.title;
    }
    return post;
  });

  // Users
  fastify.get('/users', async () => db.users);

  fastify.get('/users/:id', async (request, reply) => {
    const user = db.users.find((u) => u.id == request.params.id);
    if (!user) {
      reply.code(404);
      return { error: 'User not found' };
    }
    return user;
  });

  // Comments
  fastify.get('/comments/:id', async (request, reply) => {
    const comment = db.comments.find((c) => c.id == request.params.id);
    if (!comment) {
      reply.code(404);
      return { error: 'Comment not found' };
    }
    return comment;
  });

  // Todos
  fastify.get('/todos/1', async () => db.todos[0]);

  // Albums
  fastify.get('/albums', async () => db.albums);

  // Photos (echo params in response)
  fastify.get('/photos', async (request) => {
    const { query } = request;
    return { params: query, data: db.photos };
  });

  // Binary/image
  fastify.get('/image/150x150', async (_request, reply) => {
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hAgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    reply.type('image/png');
    return pixel;
  });

  // HTML
  fastify.get('/html', async (_request, reply) => {
    reply.type('text/html');
    return '<html><head></head><body><h1>This is HTML</h1></body></html>';
  });

  // Delay endpoint
  fastify.get('/delay/:seconds', async (request) => {
    const seconds = parseInt(request.params.seconds, 10);
    await sleep(seconds * 1000);
    return { message: `Delayed for ${seconds} seconds` };
  });

  // Headers echo
  fastify.get('/headers', async (request) => ({ headers: request.headers }));
}

module.exports = demoRoutes;
