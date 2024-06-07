import { ModelController } from "@/libraries/ModelController";
import { Funcion } from "../../db/models/Funcion/model/Funcion";
import { Router, Request, Response } from "express";
import { validateJWT } from "@/policies/General";
import { Movie } from "../../db/models/Movie/model/Movie";
import { Op } from "sequelize";

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

    return this.router;
  }

  async handleFindAllWithMovie(req: Request, res: Response) {
    try {
      const data = await this.model.findAll({ include: [Movie] });
      res.status(200).send({ data });
    } catch (error) {
      console.error("Error fetching functions with movies:", error);
      res.status(500).send({ error: error.message });
    }
  }

  async handleFindOneWithMovie(req: Request, res: Response) {
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

  async handleCreate(req: Request, res: Response) {
    const { movieId, salaId, startTime, category } = req.body;

    const [hours, minutes] = startTime.split(":").map(Number);
    const startTimeInMinutes = hours * 60 + minutes;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(400).json({ message: "Invalid movie ID" });
    }

    const endTimeInMinutes = startTimeInMinutes + movie.duration;

    try {
      // Verificar disponibilidad de la sala
      const conflict = await Funcion.findOne({
        where: {
          salaId,
          [Op.or]: [
            {
              startTime: {
                [Op.between]: [startTimeInMinutes, endTimeInMinutes],
              },
            },
            {
              endTime: {
                [Op.between]: [startTimeInMinutes, endTimeInMinutes],
              },
            },
            {
              [Op.and]: [
                {
                  startTime: {
                    [Op.lte]: startTimeInMinutes,
                  },
                },
                {
                  endTime: {
                    [Op.gte]: endTimeInMinutes,
                  },
                },
              ],
            },
          ],
        },
      });

      if (conflict) {
        return res.status(400).json({
          message: "La sala ya está ocupada en el horario seleccionado",
        });
      }

      const nuevaFuncion = await Funcion.create({
        ...req.body,
        startTime: startTimeInMinutes,
        endTime: endTimeInMinutes,
      });
      res.status(201).send({ data: nuevaFuncion });
    } catch (error) {
      console.error("Error creating function:", error);
      res.status(500).send({ error: error.message });
    }
  }
}

const funcion = new FuncionController();
export default funcion;
