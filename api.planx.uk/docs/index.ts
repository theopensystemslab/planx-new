import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  },
};

const parameters = {
  sessionId: {
    in: "path",
    name: "sessionId",
    type: "string",
    required: true,
    description: "Session ID",
  },
  localAuthority: {
    in: "path",
    name: "localAuthority",
    type: "string",
    required: true,
    description:
      "Name of the Local Authority, usually the same as Planx `team`",
  },
  hasuraAuth: {
    name: "authorization",
    in: "header",
    description: "An authorisation header provided by Hasura",
    required: true,
    type: "string",
  },
};

const schemas = {
  SessionPayload: {
    type: "object",
    properties: {
      payload: {
        type: "object",
        properties: {
          sessionId: {
            type: "string",
          },
        },
      },
    },
    example: {
      payload: {
        sessionId: "123",
      },
    },
  },
};

const responses = {
  Unauthorised: {
    description: "Unauthorised error",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            error: {
              type: "string",
              enum: ["Access denied"],
            },
          },
        },
      },
    },
  },
  SuccessMessage: {
    description: "Success message",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Success!",
            },
          },
        },
      },
    },
  },
  ErrorMessage: {
    description: "Error message",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Error!",
            },
          },
        },
      },
    },
  },
};

// Swagger documentation config
const options = {
  failOnErrors: true,
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Plan✕ API",
      version: "0.1.0",
      description:
        "Plan✕ is a platform for creating and publishing digital planning services. Our REST API is built on Express and documented with Swagger.",
      license: {
        name: "MPL-2.0",
        url: "https://github.com/theopensystemslab/planx-new/blob/main/LICENSE.md",
      },
    },
    schemes: ["http", "https"],
    servers: [{ url: process.env.API_URL_EXT }],
    components: {
      securitySchemes,
      parameters,
      schemas,
      responses,
    },
  },
  apis: ["./**/*.ts", "./**/*.js", "./**/docs.yaml"],
};

export const useSwaggerDocs = (app: Express) => {
  const swaggerSpec = swaggerJSDoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
