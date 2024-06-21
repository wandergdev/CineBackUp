import { Router, Request, Response } from "express";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";
import { ModelController } from "@/libraries/ModelController";
import { log } from "@/libraries/Log";
import { Funcion } from "@/db/models/Funcion/model/Funcion";

export class TicketController extends ModelController<ComprarTaquilla> {
  constructor() {
    super();
    this.name = "comprartaquilla";
    this.model = ComprarTaquilla;
  }

  routes(): Router {
    this.router.post("/verify-qr", async (req: Request, res: Response) => {
      const { qrCode } = req.body;

      log.info(`Recibido código QR: ${qrCode}`);
      try {
        const compra = await this.model.findOne({
          where: { qrCode },
          include: [
            {
              model: Funcion,
              as: "funcion",
              include: ["movie", "sala"],
            },
          ],
        });

        if (!compra) {
          log.error("Código QR no encontrado");
          return res.status(404).json({ message: "Código QR no encontrado." });
        }

        if (compra.scanned) {
          log.error("Código QR ya escaneado");
          return res.status(400).json({ message: "Código QR ya escaneado." });
        }

        if (new Date() > compra.validUntil) {
          log.error("Código QR expirado");
          return res.status(400).json({ message: "Código QR expirado." });
        }

        // Marcar el código QR como escaneado
        compra.scanned = true;
        await compra.save();

        log.info("Datos de la compra:", compra.toJSON()); // Añadir logs para ver los datos
        return res
          .status(200)
          .json({ message: "Código QR válido.", compra: compra.toJSON() });
      } catch (error) {
        log.error("Error verificando el código QR", { error });
        return res.status(500).json({ message: error.message });
      }
    });

    return this.router;
  }
}

const ticketController = new TicketController();
export default ticketController;
