import { Router, Request, Response } from "express";
import paymentService from "@/services/PaymentService";
import emailService from "@/services/EmailService";
import { validateJWT } from "@/policies/General";
import { Sala } from "@/db/models/Sala/model/Sala";
import { Funcion } from "@/db/models/Funcion/model/Funcion";
import { ComprarTaquilla } from "@/db/models/ComprarTaquilla/model/ComprarTaquilla";
import { log } from "@/libraries/Log";

const router = Router();

const MIN_USD_AMOUNT = 0.5; // 50 centavos en USD
const USD_TO_DOP_CONVERSION_RATE = 59.3;
const MIN_DOP_AMOUNT = Math.ceil(MIN_USD_AMOUNT * USD_TO_DOP_CONVERSION_RATE); // Redondear hacia arriba para asegurarse de cumplir con el requisito

router.post(
  "/create-payment-intent",
  validateJWT("access"),
  async (req: Request, res: Response) => {
    log.info("Request to create payment intent received", { body: req.body });
    const { amount, currency } = req.body;
    try {
      if (amount < MIN_DOP_AMOUNT) {
        log.warn("Amount less than 50 cents in USD", { amount });
        return res.status(400).send({
          error: `El monto mínimo debe ser 50 centavos en USD. ${amount} DOP no cumple con este requisito.`,
        });
      }

      // Convert amount from DOP to USD cents
      const amountInUSDCents = Math.ceil(
        (amount / USD_TO_DOP_CONVERSION_RATE) * 100,
      );

      const paymentIntent = await paymentService.createPaymentIntent(
        amountInUSDCents,
        currency,
      );
      log.info("Payment intent created successfully", {
        clientSecret: paymentIntent.client_secret,
      });
      res.status(200).send({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      log.error("Error creating payment intent", { error });
      res.status(500).send({ error: error.message });
    }
  },
);

router.post(
  "/confirm-payment",
  validateJWT("access"),
  async (req: Request, res: Response) => {
    log.info("Request to confirm payment received", { body: req.body });
    const { paymentIntentId, paymentMethodId } = req.body;
    try {
      const paymentIntent = await paymentService.confirmPayment(
        paymentIntentId,
        paymentMethodId,
      );
      log.info("Payment intent confirmed successfully", { paymentIntent });
      res.status(200).send(paymentIntent);
    } catch (error) {
      log.error("Error confirming payment intent", { error });
      res.status(500).send({ error: error.message });
    }
  },
);

router.post(
  "/purchase",
  validateJWT("access"),
  async (req: Request, res: Response) => {
    log.info("Request to purchase tickets received", { body: req.body });
    try {
      const {
        userId,
        funcionId,
        salaId,
        cantidadTaquillas,
        tipoTaquilla,
        paymentMethodId,
      } = req.body;

      if (cantidadTaquillas > 5) {
        log.warn("Trying to purchase more than 5 tickets", {
          cantidadTaquillas,
        });
        return res
          .status(400)
          .json({ message: "No puedes comprar más de 5 taquillas." });
      }

      const funcion = await Funcion.findByPk(funcionId, {
        include: [Sala],
      });

      if (!funcion) {
        log.warn("Function not found", { funcionId });
        return res.status(404).json({ message: "Función no encontrada." });
      }

      const sala = await Sala.findByPk(salaId);
      if (!sala) {
        log.warn("Room not found", { salaId });
        return res.status(404).json({ message: "Sala no encontrada." });
      }

      const amount =
        tipoTaquilla === "VIP"
          ? 250 * cantidadTaquillas
          : 150 * cantidadTaquillas;
      const currency = "dop"; // Moneda local

      log.info("Calculated amount for tickets", { amount, currency });

      const amountInUSDCents = Math.ceil(
        (amount / USD_TO_DOP_CONVERSION_RATE) * 100,
      );
      if (amountInUSDCents < MIN_USD_AMOUNT * 100) {
        log.warn("Amount less than 50 cents in USD", {
          amount,
          amountInUSDCents,
        });
        return res.status(400).json({
          message: `El monto mínimo de compra debe ser al menos 50 centavos en USD. ${amount} DOP no cumple con este requisito.`,
        });
      }

      const paymentIntent = await paymentService.createPaymentIntent(
        amountInUSDCents,
        currency,
      );
      log.info("Payment intent created", { paymentIntentId: paymentIntent.id });

      const confirmedPayment = await paymentService.confirmPayment(
        paymentIntent.id,
        paymentMethodId,
      );
      log.info("Payment confirmed", { paymentIntentId: paymentIntent.id });

      if (confirmedPayment.status !== "succeeded") {
        log.error("Payment not succeeded", { confirmedPayment });
        return res.status(400).json({ message: "Error en el pago." });
      }

      const qrCodeData = `Ticket-${userId}-${funcionId}-${cantidadTaquillas}-${new Date().toISOString()}`;
      const qrCode = await emailService.generateQRCode(qrCodeData);
      log.info("QR Code generated", { qrCodeData });

      const compra = await ComprarTaquilla.create({
        userId,
        funcionId,
        cantidadTaquillas,
        tipoTaquilla,
        costoTotal: amount,
        fechaHoraCompra: new Date(),
        estadoTransaccion: "Completada",
        qrCode,
      });
      log.info("Ticket purchase created", { compra });

      await emailService.sendTicketEmail(userId, {
        funcion,
        sala,
        cantidadTaquillas,
        tipoTaquilla,
        qrCode,
        fechaHoraCompra: compra.fechaHoraCompra,
      });

      log.info("Ticket email sent successfully");

      return res.status(200).json({ data: compra });
    } catch (error) {
      log.error("Error in ticket purchase", { error, stack: error.stack });
      return res.status(500).json({ message: error.message });
    }
  },
);

export default {
  name: "payment",
  routes: () => router,
};
