import { Router, Request, Response } from "express";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";
import { ModelController } from "@/libraries/ModelController";
import { validateJWT } from "@/policies/General";
import { log } from "@/libraries/Log";

export class TicketController extends ModelController<ComprarTaquilla> {
  constructor() {
    super();
    this.name = "comprartaquilla";
    this.model = ComprarTaquilla;
  }

  routes(): Router {
    this.router.post(
      "/verify-qr",
      validateJWT("access"),
      async (req: Request, res: Response) => {
        const { qrCode } = req.body;

        try {
          const compra = await this.model.findOne({ where: { qrCode } });

          if (!compra) {
            return res
              .status(404)
              .json({ message: "Código QR no encontrado." });
          }

          if (compra.scanned) {
            return res.status(400).json({ message: "Código QR ya escaneado." });
          }

          if (new Date() > compra.validUntil) {
            return res.status(400).json({ message: "Código QR expirado." });
          }

          // Marcar el código QR como escaneado
          compra.scanned = true;
          await compra.save();

          return res.status(200).json({ message: "Código QR válido.", compra });
        } catch (error) {
          log.error("Error verifying QR code", { error });
          return res.status(500).json({ message: error.message });
        }
      },
    );

    return this.router;
  }
}

const ticketController = new TicketController();
export default ticketController;
