import { ModelController } from "@/libraries/ModelController";
import { Funcion } from "../../db/models/Funcion/model/Funcion";
import { Router } from "express";
import { validateBody } from "@/libraries/Validator";
import { FuncionSchema } from "@/validators/Funcion";
import { validateJWT, appendUser } from "@/policies/General";

export class FuncionController extends ModelController<Funcion> {
  constructor() {
    super();
    this.name = "funcion";
    this.model = Funcion;
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
      validateBody(FuncionSchema),
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

const funcion = new FuncionController();
export default funcion;
