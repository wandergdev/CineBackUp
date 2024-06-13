import { Movie } from "@/db/models/Movie/model/Movie";
import { ModelController } from "@/libraries/ModelController";
import { validateBody } from "@/libraries/Validator";
import { stripNestedObjects, validateJWT } from "@/policies/General";
import {
  getMovieListFromApi,
  mapMovieToDatabase,
  searchMoviesFromApi,
} from "@/services/MovieService";
import { MovieSchema } from "@/validators/Movie";
import { Router, Request, Response } from "express";

export class MovieController extends ModelController<Movie> {
  constructor() {
    super();
    this.name = "movie";
    this.model = Movie;
  }

  routes(): Router {
    this.router.get("/", (req, res) => {
      this.handleFindAll(req, res);
    });
    this.router.get("/from-movie-api/", (req, res) =>
      getMovieListFromApi(req, res),
    );
    this.router.get("/map-to-db/", (req, res) => mapMovieToDatabase(req, res));
    this.router.get("/search", async (req, res) => {
      try {
        const { query } = req.query;
        const results = await searchMoviesFromApi(String(query));
        res.json({ data: results });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });
    this.router.get("/movie-poster/", (req, res) =>
      mapMovieToDatabase(req, res),
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

    // Agregar ruta para actualizar el campo 'proximamente'
    this.router.put(
      "/:id/proximamente",
      validateJWT("access"),
      async (req, res) => {
        try {
          const movie = await this.model.findByPk(req.params.id);
          if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
          }
          movie.proximamente = req.body.proximamente;
          await movie.save();
          res.status(200).json({ data: movie });
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      },
    );

    return this.router;
  }
}

const movie = new MovieController();
export default movie;
