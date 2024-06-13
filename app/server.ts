import { config } from "@/config";
import { log, requestLogStream } from "@/libraries/Log";
import { routes } from "@/routes";
import { swaggerSpec } from "@/swaggerConfiguration";
import compression from "compression";
import express from "express";
import basicAuth from "express-basic-auth";
import helmet from "helmet";
import { createServer } from "http";
import { noop } from "lodash";
import methodOverride from "method-override";
import morgan from "morgan";
// import passport from "passport";
import path from "path";
import favicon from "serve-favicon";
import { Movie } from "@/db/models/Movie/model/Movie";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import { EmailAuthController } from "./controllers/v1/EmailAuth"; // Ajusta la ruta según tu estructura de proyecto

export const app = express();
export const server = createServer(app);

// Security middleware
app.use(helmet());
// Util middleware
app.use(methodOverride());
app.use(favicon(path.join(__dirname, "../public/favicon.ico")));
// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
// Response compression
app.use(compression());
// use morgan to log requests to the console
app.use(morgan("short", { stream: requestLogStream }));

const swaggerUIMiddleware = swaggerUi.setup(swaggerSpec);
const req: any = {};
const res: any = { send: noop };
swaggerUIMiddleware(req, res, noop);

// swagger configuration
app.use(
  config.swagger.route,
  config.swagger.hasAuth
    ? basicAuth({
        users: {
          [`${config.swagger.username}`]: config.swagger.password,
        },
        challenge: true,
      })
    : (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => next(),
  (req, res, next) => {
    const isServerless = req => {
      const serverlessStages = ["dev"];
      return req.requestContext
        ? serverlessStages.some(stage => stage === req.requestContext["stage"])
        : false;
    };

    if (req.originalUrl === "/swagger" && !isServerless(req)) {
      const swaggerUrl = `${config.urls.protocol}://${req.get("host")}${
        req.originalUrl
      }/`;
      return res.redirect(swaggerUrl);
    }

    // avoid infinite loop when http;//host:port/dev/swagger is called by client and back redirect to http;//host:port/dev/swagger/
    // originalUrl is the same for both url
    if (req.originalUrl === "/swagger" && isServerless(req)) {
      const swaggerUrl = `${config.urls.protocol}://${req.get("host")}/dev${
        req.originalUrl
      }/?isRedirect=true`;
      return res.redirect(swaggerUrl);
    }

    next();
  },
  swaggerUi.serveWithOptions({ redirect: false }),
  swaggerUIMiddleware,
);

app.set("views", `${config.root}/views`);
app.set("view engine", "ejs");

// // Passport for auth and SSO
// app.use(passport.initialize());

// Enable CORS
// Configuración de CORS para aceptar solicitudes de tu frontend
app.use(
  cors({
    origin: "http://localhost:3000", // URL de tu frontend
    credentials: true, // Permitir el envío de cookies y credenciales de autenticación
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"], // Métodos HTTP permitidos
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ], // Cabeceras permitidas
    exposedHeaders: ["Content-Count", "Content-Disposition", "Content-Type"], // Cabeceras expuestas
  }),
);

routes(app);

export function setupServer(): Promise<void> {
  return new Promise((resolve, _reject) => {
    server.listen(config.server.port, async () => {
      log.info(`Server started at port ${config.server.port}`);

      // Sincroniza el modelo de Movie para asegurarte de que la columna "proximamente" esté presente
      await Movie.sync({ alter: true });

      resolve();
    });
  });
}
