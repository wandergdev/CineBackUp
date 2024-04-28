import { ModelController } from "@/libraries/ModelController";
import { PrecioTaquillas } from "@/db/models/PrecioTaquillas/model/PrecioTaquillas";
import { Router } from "express";
import { validateJWT } from "@/policies/General";

export class PrecioTaquillasController extends ModelController<
  PrecioTaquillas
> {
  constructor() {
    super();
    this.name = "preciotaquillas";
    this.model = PrecioTaquillas;
  }

  routes(): Router {
    this.router.get("/", validateJWT("access"), (req, res) =>
      this.handleFindAll(req, res),
    );
    this.router.get("/:id", validateJWT("access"), (req, res) =>
      this.handleFindOne(req, res),
    );
    this.router.post("/", validateJWT("access"), (req, res) =>
      this.handleCreate(req, res),
    );
    this.router.put("/:id", validateJWT("access"), (req, res) =>
      this.handleUpdate(req, res),
    );
    this.router.delete("/:id", (req, res) => this.handleDelete(req, res));

    return this.router;
  }
}

const preciotaquillas = new PrecioTaquillasController();
export default preciotaquillas;
