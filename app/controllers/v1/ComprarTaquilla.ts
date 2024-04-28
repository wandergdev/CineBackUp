import { ModelController } from "@/libraries/ModelController";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";
import { Router } from "express";
import { validateJWT, filterOwner, appendUser } from "@/policies/General";

export class ComprarTaquillaController extends ModelController<
  ComprarTaquilla
> {
  constructor() {
    super();
    this.name = "comprartaquilla";
    this.model = ComprarTaquilla;
  }

  routes(): Router {
    this.router.get("/", validateJWT("access"), filterOwner(), (req, res) =>
      this.handleFindAll(req, res),
    );
    this.router.get("/:id", validateJWT("access"), filterOwner(), (req, res) =>
      this.handleFindOne(req, res),
    );
    this.router.post("/", validateJWT("access"), appendUser(), (req, res) =>
      this.handleCreate(req, res),
    );
    this.router.put(
      "/:id",
      validateJWT("access"),

      (req, res) => this.handleUpdate(req, res),
    );
    this.router.delete(
      "/:id",
      validateJWT("access"),

      (req, res) => this.handleDelete(req, res),
    );

    return this.router;
  }
}

const comprartaquilla = new ComprarTaquillaController();
export default comprartaquilla;
