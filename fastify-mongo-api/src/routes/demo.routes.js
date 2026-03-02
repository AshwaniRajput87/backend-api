const db = require("../demo-data");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryAttempts = new Map();

async function demoRoutes(fastify) {
  // Posts
  fastify.get("/posts", async () => db.posts);

  fastify.get("/posts/:id", async (request, reply) => {
    const post = db.posts.find((p) => p.id == request.params.id);
    if (!post) {
      reply.code(404);
      return { error: "Post not found" };
    }
    if (request.headers["accept"]?.includes("text/plain")) {
      reply.type("text/plain");
      return JSON.stringify(post);
    }
    return post;
  });

  fastify.post("/posts", async (request, reply) => {
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

  fastify.patch("/posts/:id", async (request, reply) => {
    const post = db.posts.find((p) => p.id == request.params.id);
    if (!post) {
      reply.code(404);
      return { error: "Post not found" };
    }
    if (request.body?.title) {
      post.title = request.body.title;
    }
    return post;
  });

  // Users
  fastify.get("/users", async () => db.users);

  fastify.get("/users/:id", async (request, reply) => {
    const user = db.users.find((u) => u.id == request.params.id);
    if (!user) {
      reply.code(404);
      return { error: "User not found" };
    }
    return user;
  });

  // Comments
  fastify.get("/comments/:id", async (request, reply) => {
    const comment = db.comments.find((c) => c.id == request.params.id);
    if (!comment) {
      reply.code(404);
      return { error: "Comment not found" };
    }
    return comment;
  });

  // Todos
  fastify.get("/todos/1", async () => db.todos[0]);

  // Albums
  fastify.get("/albums", async () => db.albums);

  // Photos (echo params in response)
  fastify.get("/photos", async (request) => {
    const { query } = request;
    return { params: query, data: db.photos };
  });

  // Binary/image
  fastify.get("/image/150x150", async (_request, reply) => {
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hAgAHggJ/PchI7wAAAABJRU5ErkJggg==",
      "base64",
    );
    reply.type("image/png");
    return pixel;
  });

  // HTML
  fastify.get("/html", async (_request, reply) => {
    reply.type("text/html");
    return "<html><head></head><body><h1>This is HTML</h1></body></html>";
  });

  // Delay endpoint
  fastify.get("/delay/:seconds", async (request) => {
    const seconds = parseInt(request.params.seconds, 10);
    await sleep(seconds * 1000);
    return { message: `Delayed for ${seconds} seconds` };
  });

  // Headers echo
  fastify.get("/headers", async (request) => ({ headers: request.headers }));

  //retry
  fastify.get("/retry/:key", async (request, reply) => {
    const { key } = request.params;
    const failures = Math.max(0, Number(request.query?.failures ?? 2));
    const previousAttempts = retryAttempts.get(key) ?? 0;
    const attempt = previousAttempts + 1;
    retryAttempts.set(key, attempt);

    if (attempt <= failures) {
      reply.code(500);

      return {
        success: false,
        attempt,
        message: `Temporary failure on attempt ${attempt}`,
      };
    }

    retryAttempts.delete(key);

    return {
      success: true,

      attempt,

      message: `Succeeded on attempt ${attempt}`,
    };
  });

// download
  fastify.get(
  "/download/large",
  async (_request, reply) => {
    const size =
      1024 * 1024;

    const buffer =
      Buffer.alloc(
        size,
        "a",
      );

    reply.header(
      "Content-Type",
      "application/octet-stream",
    );

    reply.header(
      "Content-Length",
      String(
        buffer.length,
      ),
    );

    return buffer;
  },
);

// upload
fastify.post(
  "/upload/raw",
  async (request, reply) => {
    const body = request.body;

    if (!Buffer.isBuffer(body)) {
      reply.code(400);

      return {
        success: false,
        message:
          "Expected binary request body",
      };
    }

    return {
      success: true,
      size: body.length,
    };
  },
);

/*
 * ------------------------------------------------------------
 * Redirect testing
 * ------------------------------------------------------------
 */

fastify.get(
  "/redirect/final",
  async () => {
    return {
      success: true,
      message:
        "Redirect completed successfully",
    };
  },
);

fastify.get(
  "/redirect/once",
  async (_request, reply) => {
    return reply.redirect(
      "/redirect/final",
    );
  },
);

/*
 * ------------------------------------------------------------
 * maxRedirects testing
 * ------------------------------------------------------------
 */

fastify.get(
  "/redirect/chain/1",
  async (_request, reply) => {
    return reply.redirect(
      "/redirect/chain/2",
    );
  },
);

fastify.get(
  "/redirect/chain/2",
  async (_request, reply) => {
    return reply.redirect(
      "/redirect/chain/3",
    );
  },
);

fastify.get(
  "/redirect/chain/3",
  async (_request, reply) => {
    return reply.redirect(
      "/redirect/chain/final",
    );
  },
);

fastify.get(
  "/redirect/chain/final",
  async () => {
    return {
      success: true,

      message:
        "Redirect chain completed successfully",
    };
  },
);

/*
 * ------------------------------------------------------------
 * XSRF testing
 * ------------------------------------------------------------
 */

fastify.get(
  "/xsrf/token",
  async (_request, reply) => {
    reply.header(
      "Set-Cookie",
      [
        "XSRF-TOKEN=wci-xsrf-test-token",
        "Path=/",
        "SameSite=Lax",
      ].join("; "),
    );

    return {
      success: true,
      message: "XSRF cookie set",
    };
  },
);

fastify.post(
  "/xsrf/protected",
  async (request, reply) => {
    const cookieHeader =
      request.headers.cookie ?? "";

    const xsrfHeader =
      request.headers["x-xsrf-token"];

    const hasCookie =
      cookieHeader.includes(
        "XSRF-TOKEN=wci-xsrf-test-token",
      );

    const validHeader =
      xsrfHeader ===
      "wci-xsrf-test-token";

    if (
      !hasCookie ||
      !validHeader
    ) {
      reply.code(403);

      return {
        success: false,
        message:
          "Invalid XSRF token",
      };
    }

    return {
      success: true,
      message:
        "XSRF validation successful",
    };
  },
);

/*
 * --------------------------------------------------------------------------
 * Basic Authentication
 * --------------------------------------------------------------------------
 */

fastify.get(
  "/basic-auth/protected",
  async (request, reply) => {
    const authorization =
      request.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Basic ")
    ) {
      reply.code(401);

      return {
        success: false,
        message: "Basic authentication required",
      };
    }

    const encodedCredentials =
      authorization.slice("Basic ".length);

    let credentials;

    try {
      credentials = Buffer
        .from(
          encodedCredentials,
          "base64",
        )
        .toString("utf8");
    } catch {
      reply.code(401);

      return {
        success: false,
        message: "Invalid Basic authentication",
      };
    }

    const separatorIndex =
      credentials.indexOf(":");

    if (separatorIndex === -1) {
      reply.code(401);

      return {
        success: false,
        message: "Invalid Basic authentication",
      };
    }

    const username =
      credentials.slice(
        0,
        separatorIndex,
      );

    const password =
      credentials.slice(
        separatorIndex + 1,
      );

    if (
      username !== "himansu" ||
      password !== "secret123"
    ) {
      reply.code(401);

      return {
        success: false,
        message: "Invalid username or password",
      };
    }

    return {
      success: true,

      message:
        "Basic authentication successful",

      username,
    };
  },
);

/* -------------------------------------------------------------------------- */
/* HEAD                                                                       */
/* -------------------------------------------------------------------------- */

fastify.head(
  "/http/head",
  async (_request, reply) => {
    reply.header(
      "X-WCI-Test",
      "head-success",
    );

    reply.header(
      "X-WCI-Version",
      "1.0.0",
    );

    reply.code(200);

    return reply.send();
  },
);

/* -------------------------------------------------------------------------- */
/* OPTIONS                                                                    */
/* -------------------------------------------------------------------------- */

fastify.options(
  "/http/options",
  async (_request, reply) => {
    reply.header(
      "Allow",
      "GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS",
    );

    return {
      success: true,

      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS",
      ],
    };
  },
);

/*
 * --------------------------------------------------------------------------
 * Retry-After / 429
 * --------------------------------------------------------------------------
 */

const rateLimitAttempts =
  new Map();

fastify.get(
  "/retry-after/:key",
  async (request, reply) => {
    const {
      key,
    } = request.params;

    const currentAttempt =
      (
        rateLimitAttempts.get(
          key,
        ) ?? 0
      ) + 1;

    rateLimitAttempts.set(
      key,
      currentAttempt,
    );

    /*
     * Fail first two requests.
     */

    if (
      currentAttempt <= 2
    ) {
      reply.code(429);

      reply.header(
        "Retry-After",
        "1",
      );

      return {
        success: false,

        attempt:
          currentAttempt,

        message:
          "Rate limit exceeded",
      };
    }

    /*
     * Clean up after success.
     */

    rateLimitAttempts.delete(
      key,
    );

    return {
      success: true,

      attempt:
        currentAttempt,

      message:
        "Request succeeded after rate limit",
    };
  },
);

}



module.exports = demoRoutes;
