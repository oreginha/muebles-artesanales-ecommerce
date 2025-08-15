'use strict';

/**
 * webhook controller
 */

const crypto = require('crypto');
const { MercadoPagoConfig, Payment } = require('mercadopago');

module.exports = {
  async mercadopago(ctx) {
    try {
      const signature = ctx.request.headers['x-signature'];
      const requestId = ctx.request.headers['x-request-id'];
      const body = ctx.request.body;

      // Verify webhook signature (if secret is configured)
      if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
        const expectedSignature = crypto
          .createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
          .update(JSON.stringify(body))
          .digest('hex');

        if (signature !== expectedSignature) {
          console.log('Invalid webhook signature');
          return ctx.unauthorized('Invalid signature');
        }
      }

      console.log('MercadoPago webhook received:', {
        type: body.type,
        action: body.action,
        dataId: body.data?.id,
        requestId,
      });

      // Process different types of notifications
      if (body.type === 'payment') {
        await processPaymentNotification(body.data.id);
      } else if (body.type === 'plan') {
        // Handle subscription plans if needed
        console.log('Plan notification received:', body.data.id);
      } else if (body.type === 'subscription') {
        // Handle subscription notifications if needed
        console.log('Subscription notification received:', body.data.id);
      }

      // Always respond with 200 to acknowledge receipt
      ctx.send({ status: 'received' });

    } catch (error) {
      console.error('Error processing MercadoPago webhook:', error);
      ctx.send({ status: 'error', message: error.message });
    }
  },
};

// Process payment notification
async function processPaymentNotification(paymentId) {
  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });

    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log('Payment data received:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference,
    });

    // Process the payment through the order service
    await strapi.service('api::order.order').processMercadoPagoWebhook(paymentData);

  } catch (error) {
    console.error('Error processing payment notification:', error);
    throw error;
  }
}
