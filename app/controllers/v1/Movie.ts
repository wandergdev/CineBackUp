import { Movie } from "@/db/models/Movie/model/Movie";
import { ModelController } from "@/libraries/ModelController";
import { validateBody } from "@/libraries/Validator";
import { stripNestedObjects, validateJWT } from "@/policies/General";
import {
  getMovieListFromApi,
  mapMovieToDatabase,
} from "@/services/MovieService";
import { MovieSchema } from "@/validators/Movie";
import { Router } from "express";

export class MovieController extends ModelController<Movie> {
  constructor() {
    super();
    this.name = "movie";
    this.model = Movie;
  }

  routes(): Router {
    this.router.get("/", validateJWT("access"), (req, res) =>
      this.handleFindAll(req, res),
    );
    this.router.get(
      "/from-movie-api/",
      /*  validateJWT("access"), */ (req, res) => getMovieListFromApi(req, res),
    );
    this.router.get(
      "/map-to-db/",
      /*  validateJWT("access"), */ (req, res) => mapMovieToDatabase(req, res),
    );
    this.router.get(
      "/movie-poster/",
      /*  validateJWT("access"), */ (req, res) => mapMovieToDatabase(req, res),
    );
    this.router.get("/:id", validateJWT("access"), (req, res) =>
      this.handleFindOne(req, res),
    );
    this.router.post(
      "/",
      validateJWT("access"),
      validateBody(MovieSchema),
      (req, res) => this.handleCreate(req, res),
    );
    this.router.put(
      "/:id",
      validateJWT("access"),
      stripNestedObjects(),
      (req, res) => this.handleUpdate(req, res),
    );
    this.router.delete("/:id", validateJWT("access"), (req, res) =>
      this.handleDelete(req, res),
    );

    return this.router;
  }
}

const movie = new MovieController();
export default movie;
