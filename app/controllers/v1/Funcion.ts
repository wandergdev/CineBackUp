import { ModelController } from "@/libraries/ModelController";
import { Funcion } from "../../db/models/Funcion/model/Funcion";
import { Router } from "express";
import { validateJWT } from "@/policies/General";
import { Movie } from "../../db/models/Movie/model/Movie";

export class FuncionController extends ModelController<Funcion> {
  constructor() {
    super();
    this.name = "funcion";
    this.model = Funcion;
  }

  routes(): Router {
    this.router.get("/", validateJWT("access"), (req, res) =>
      this.handleFindAllWithMovie(req, res),
    );
    this.router.get("/:id", validateJWT("access"), (req, res) =>
      this.handleFindOneWithMovie(req, res),
    );
    this.router.post("/", validateJWT("access"), (req, res) =>
      this.handleCreate(req, res),
    );
    this.router.put("/:id", validateJWT("access"), (req, res) =>
      this.handleUpdate(req, res),
    );
    this.router.delete("/:id", validateJWT("access"), (req, res) =>
      this.handleDelete(req, res),
    );

    // Custom delete route
    this.router.delete("/:id", validateJWT("access"), (req, res) => {
      this.model
        .destroy({ where: { id: req.params.id } })
        .then(() => res.status(200).send({ message: "Deleted successfully" }))
        .catch((error: any) => res.status(500).send({ error: error.message }));
    });

    return this.router;
  }

  async handleFindAllWithMovie(req, res) {
    try {
      const data = await this.model.findAll({ include: [Movie] });
      res.status(200).send({ data });
    } catch (error) {
      console.error("Error fetching functions with movies:", error);
      res.status(500).send({ error: error.message });
    }
  }

  async handleFindOneWithMovie(req, res) {
    try {
      const data = await this.model.findOne({
        where: { id: req.params.id },
        include: [Movie],
      });
      if (!data) {
        return res.status(404).send({ message: "Function not found" });
      }
      res.status(200).send({ data });
    } catch (error) {
      console.error("Error fetching function with movie:", error);
      res.status(500).send({ error: error.message });
    }
  }
}

const funcion = new FuncionController();
export default funcion;
