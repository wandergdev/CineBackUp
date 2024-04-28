import { ModelController } from "@/libraries/ModelController";
import { Sala } from "../../db/models/Sala/model/Sala";
import { Router } from "express";
import { appendUser, validateJWT } from "@/policies/General";
import { validateBody } from "@/libraries/Validator";
import { SalaSchema } from "@/validators/Sala";

export class SalaController extends ModelController<Sala> {
  constructor() {
    super();
    this.name = "sala";
    this.model = Sala;
  }

  routes(): Router {
    // Asegurar rutas con JWT y posiblemente verificar propiedad
    this.router.get("/", validateJWT("access"), (req, res) =>
      this.handleFindAll(req, res),
    );
    this.router.get("/:id", validateJWT("access"), (req, res) =>
      this.handleFindOne(req, res),
    );
    this.router.post(
      "/",
      validateJWT("access"),
      validateBody(SalaSchema),
      appendUser("createdBy"),
      (req, res) => this.handleCreate(req, res),
    );
    this.router.put("/:id", validateJWT("access"), (req, res) =>
      this.handleUpdate(req, res),
    );
    this.router.delete("/:id", validateJWT("access"), (req, res) =>
      this.handleDelete(req, res),
    );

    return this.router;
  }
}

const sala = new SalaController();
export default sala;
