const fastify = require('fastify')({ logger: true });
fastify.register(require('@fastify/formbody'));
// Accept any JSON-like content type (including duplicated headers merged by fetch)
fastify.addContentTypeParser(/^application\/json.*$/i, { parseAs: 'string' }, (req, body, done) => {
  try {
    done(null, body ? JSON.parse(body) : {});
  } catch (err) {
    done(err, undefined);
  }
});
const db = require('./demo-data');

const PORT = 3000;

// Helper for delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ======= ROUTES =======

// --- Posts ---
fastify.get('/posts', async (request, reply) => {
  return db.posts;
});

fastify.get('/posts/:id', async (request, reply) => {
  const post = db.posts.find(p => p.id == request.params.id);
  if (!post) {
    reply.code(404);
    return { error: 'Post not found' };
  }
  if (request.headers['accept'] && request.headers['accept'].includes('text/plain')) {
    reply.type('text/plain');
    return JSON.stringify(post);
  }
  return post;
});

fastify.post('/posts', async (request, reply) => {
  const { title, body, userId } = request.body;
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
    const post = db.posts.find(p => p.id == request.params.id);
    if (!post) {
        reply.code(404);
        return { error: 'Post not found' };
    }
    const { title } = request.body;
    if (title) {
        post.title = title;
    }
    return post;
});


fastify.delete('/posts/:id', async (request, reply) => {
  const postIndex = db.posts.findIndex(p => p.id == request.params.id);
  if (postIndex === -1) {
    reply.code(404);
    return { error: 'Post not found' };
  }
  db.posts.splice(postIndex, 1);
  return { message: 'Post deleted' };
});

// --- Comments ---
fastify.get('/comments/:id', async (request, reply) => {
  const comment = db.comments.find((c) => c.id == request.params.id);
  if (!comment) {
    reply.code(404);
    return { error: 'Comment not found' };
  }
  return comment;
});


// --- Users ---
fastify.get('/users', async (request, reply) => {
  return db.users;
});

fastify.get('/users/:id', async (request, reply) => {
  const user = db.users.find(u => u.id == request.params.id);
  if (user) {
    return user;
  }
  reply.code(404);
  return { error: 'User not found' };
});

// --- Todos ---
fastify.get('/todos/1', async (request, reply) => {
  return db.todos[0];
});

// --- Albums ---
fastify.get('/albums', async (request, reply) => {
  return db.albums;
});

// --- Photos ---
fastify.get('/photos', async (request) => {
  // Echo back any query params for demo visibility while returning sample data
  return { params: request.query, data: db.photos };
});

// --- Special Demo Routes ---

fastify.get('/image/150x150', async (request, reply) => {
    // Return a dummy 1x1 red pixel png as an ArrayBuffer
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hAgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    reply.type('image/png');
    return pixel;
});


fastify.get('/html', async (request, reply) => {
  reply.type('text/html');
  return '<html><head></head><body><h1>This is HTML</h1></body></html>';
});

fastify.get('/headers', async (request, reply) => {
  return { headers: request.headers };
});

fastify.get('/delay/:seconds', async (request, reply) => {
  const seconds = parseInt(request.params.seconds, 10);
  await sleep(seconds * 1000);
  return { message: `Delayed for ${seconds} seconds` };
});


const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: '127.0.0.1' });
    console.log(`🚀 Demo server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
