import { join } from "path";
import swaggerJSDoc from "swagger-jsdoc";
import { config } from "./config/index";

function getPath(path: string): string {
  return join(process.cwd(), path);
}

function getPaths(paths: string[]): string[] {
  return paths.map(p => getPath(p));
}

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Background Engagement",
    description:
      "Welcome to the Background Engagement API documentation, if you have questions please refer to the Back End team.",
    version: "1.0.0",
  },
  servers: [
    {
      url: `${config.urls.protocol}://${config.urls.url}${
        config.urls.port.length ? ":" : ""
      }${config.urls.port}${config.urls.apiRoot}`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const swaggerOptions = {
  swaggerDefinition,
  // Note that this path is relative to the current directory from which the Node.js is ran, not the application itself.
  apis: getPaths([
    "./dist/swagger/*.yml",
    "./dist/swagger/*.yaml",
    "./dist/models/*.js",
    "./dist/controllers/v1/*.js",
  ]),
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
export { swaggerSpec };
