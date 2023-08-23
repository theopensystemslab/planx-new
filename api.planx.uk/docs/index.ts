import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

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
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./**/*.ts", "./**/*.js", "./**/docs.yaml", "./docs/*.yaml"],
};

export const useSwaggerDocs = (app: Express) => {
  const swaggerSpec = swaggerJSDoc(options);
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
