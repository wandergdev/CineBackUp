import { ModelController } from "@/libraries/ModelController";
import { Movie } from "@/db/models/Movie/model/Movie";
import { Router } from "express";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
} from "@/policies/General";

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
    this.router.get("/:id", validateJWT("access"), (req, res) =>
      this.handleFindOne(req, res),
    );
    this.router.post(
      "/",
      validateJWT("access"),
      stripNestedObjects(),
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
