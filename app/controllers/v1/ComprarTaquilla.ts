import { Request, Response, Router } from "express";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";
import { Sala } from "@/db/models/Sala/model/Sala";
import { Funcion } from "@/db/models/Funcion/model/Funcion";
import paymentService from "@/services/PaymentService";
import emailService from "@/services/EmailService";
import { validateJWT } from "@/policies/General";
import { ModelController } from "@/libraries/ModelController";

export class ComprarTaquillaController extends ModelController<
  ComprarTaquilla
> {
  constructor() {
    super();
    this.name = "comprartaquilla";
    this.model = ComprarTaquilla;
  }

  routes(): Router {
    this.router.post(
      "/purchase",
      validateJWT("access"),
      async (req: Request, res: Response) => {
        try {
          const {
            userId,
            funcionId,
            salaId,
            cantidadTaquillas,
            paymentMethodId,
          } = req.body;

          if (cantidadTaquillas > 5) {
            return res
              .status(400)
              .json({ message: "No puedes comprar más de 5 taquillas." });
          }

          const funcion = await Funcion.findByPk(funcionId, {
            include: [Sala],
          });

          if (!funcion) {
            return res.status(404).json({ message: "Función no encontrada." });
          }

          const sala = await Sala.findByPk(salaId);
          if (!sala) {
            return res.status(404).json({ message: "Sala no encontrada." });
          }

          const amount =
            sala.type === "VIP"
              ? 250 * cantidadTaquillas
              : 150 * cantidadTaquillas;
          const currency = "dop"; // Moneda local

          const paymentIntent = await paymentService.createPaymentIntent(
            amount,
            currency,
          );

          const confirmedPayment = await paymentService.confirmPayment(
            paymentIntent.id,
            paymentMethodId,
          );

          if (confirmedPayment.status !== "succeeded") {
            return res.status(400).json({ message: "Error en el pago." });
          }

          const qrCodeData = `Ticket-${userId}-${funcionId}-${cantidadTaquillas}-${new Date().toISOString()}`;
          const qrCode = await emailService.generateQRCode(qrCodeData);

          const compra = await ComprarTaquilla.create({
            userId,
            funcionId,
            cantidadTaquillas,
            tipoTaquilla: sala.type,
            costoTotal: amount,
            fechaHoraCompra: new Date(),
            estadoTransaccion: "Completada",
            qrCode,
          });

          await emailService.sendTicketEmail(userId, {
            funcion,
            sala,
            cantidadTaquillas,
            tipoTaquilla: sala.type,
            qrCode,
            fechaHoraCompra: compra.fechaHoraCompra,
          });

          return res.status(200).json({ data: compra });
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      },
    );

    return this.router;
  }
}

const comprartaquilla = new ComprarTaquillaController();
export default comprartaquilla;
