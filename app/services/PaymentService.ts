import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10", // Usa la versión más reciente recomendada
});

class PaymentService {
  async createPaymentIntent(
    amount: number,
    currency: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        payment_method_types: ["card"],
      });
      return paymentIntent;
    } catch (error) {
      throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }

  async confirmPayment(
    paymentIntentId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        { payment_method: paymentMethodId },
      );
      return paymentIntent;
    } catch (error) {
      throw new Error(`Error confirming payment intent: ${error.message}`);
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
