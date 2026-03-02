async function uploadRoutes(fastify) {
  fastify.post(
    "/upload",
    {
      schema: {
        consumes: ["multipart/form-data"],
      },
    },
    async (request, reply) => {
      const parts = request.parts();

      const fields = {};
      const files = [];

      for await (const part of parts) {
        if (part.type === "file") {
          const buffer = await part.toBuffer();

          files.push({
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            encoding: part.encoding,
            size: buffer.length,
            content: buffer.toString("utf8"),
          });

          continue;
        }

        fields[part.fieldname] = part.value;
      }

      return reply.code(200).send({
        success: true,

        message: "Multipart upload received successfully",

        fields,

        files,
      });
    },
  );

  /* File: routes/upload.routes.js */

fastify.post(
  "/upload/file-types",
  async (request) => {
    const parts = request.parts();

    const files = [];
    const fields = {};

    for await (const part of parts) {
      if (part.type === "file") {
        const buffer = await part.toBuffer();

        const fileType =
          part.mimetype.startsWith("image/")
            ? "image"
            : part.mimetype.startsWith("text/")
              ? "text"
              : part.mimetype === "application/pdf"
                ? "document"
                : part.mimetype.startsWith("video/")
                  ? "video"
                  : part.mimetype.startsWith("audio/")
                    ? "audio"
                    : "unknown";

        files.push({
          fieldname: part.fieldname,
          filename: part.filename,
          mimetype: part.mimetype,
          fileType,
          size: buffer.length,
        });

        continue;
      }

      fields[part.fieldname] = part.value;
    }

    return {
      success: true,
      fields,
      files,
    };
  },
);
}

module.exports = uploadRoutes;