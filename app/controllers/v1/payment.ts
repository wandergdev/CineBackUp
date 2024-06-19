import { Router, Request, Response } from "express";
import paymentService from "@/services/PaymentService";
import emailService from "@/services/EmailService";
import { validateJWT } from "@/policies/General";
import { Sala } from "@/db/models/Sala/model/Sala";
import { Funcion } from "@/db/models/Funcion/model/Funcion";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";

const router = Router();

router.post(
  "/create-payment-intent",
  validateJWT("access"),
  async (req: Request, res: Response) => {
    const { amount, currency } = req.body;
    try {
      if (amount < 50) {
        return res
          .status(400)
          .send({ error: "El monto mínimo debe ser 50 centavos en USD." });
      }
      const paymentIntent = await paymentService.createPaymentIntent(
        amount,
        currency,
      );
      res.status(200).send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
);

router.post(
  "/confirm-payment",
  validateJWT("access"),
  async (req: Request, res: Response) => {
    const { paymentIntentId, paymentMethodId } = req.body;
    try {
      const paymentIntent = await paymentService.confirmPayment(
        paymentIntentId,
        paymentMethodId,
      );
      res.status(200).send(paymentIntent);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
);

router.post(
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
        sala.type === "VIP" ? 250 * cantidadTaquillas : 150 * cantidadTaquillas;
      const currency = "dop"; // Moneda local

      // Validación de monto mínimo
      const amountInUSD = amount / 56.77; // Suponiendo una tasa de conversión de 1 USD = 56.77 DOP
      if (amountInUSD < 0.5) {
        return res.status(400).json({
          message:
            "El monto mínimo de compra debe ser al menos 50 centavos en USD.",
        });
      }

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
      console.error("Error en la compra:", error);
      return res.status(500).json({ message: error.message });
    }
  },
);

export default {
  name: "payment",
  routes: () => router,
};
