'use strict';

/**
 * order service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = createCoreService('api::order.order', ({ strapi }) => ({
  // Initialize MercadoPago client
  getMercadoPagoClient() {
    return new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    });
  },

  // Generate unique order number
  async generateOrderNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Count orders today to get sequence
    const startOfDay = new Date(year, now.getMonth(), now.getDate());
    const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1);
    
    const todayOrdersCount = await strapi.entityService.count('api::order.order', {
      filters: {
        createdAt: {
          $gte: startOfDay.toISOString(),
          $lt: endOfDay.toISOString(),
        },
      },
    });

    const sequence = String(todayOrdersCount + 1).padStart(4, '0');
    return `ORD-${year}${month}${day}-${sequence}`;
  },

  // Validate order data and calculate totals
  async validateOrder(orderData) {
    const { items, customer, shipping } = orderData;

    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    // Validate and enrich items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await strapi.entityService.findOne('api::product.product', item.product, {
        populate: { images: true, category: true },
      });

      if (!product) {
        throw new Error(`Product with ID ${item.product} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        product: product.id,
        productSnapshot: {
          id: product.id,
          name: product.name,
          price: product.price,
          sku: product.sku,
          category: product.category?.name,
        },
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        sku: product.sku,
        productName: product.name,
        productImage: product.images?.[0]?.url,
      });
    }

    // Calculate shipping
    const shippingCost = shipping?.cost || 0;
    
    // Calculate taxes (if applicable)
    const taxAmount = 0; // Argentina usually includes taxes in price
    
    // Calculate total
    const total = subtotal + shippingCost + taxAmount;

    return {
      items: validatedItems,
      customer,
      shipping: {
        ...shipping,
        cost: shippingCost,
      },
      subtotal,
      taxAmount,
      shippingCost,
      total,
      currency: orderData.currency || 'ARS',
    };
  },

  // Create MercadoPago preference
  async createMercadoPagoPreference(order) {
    try {
      const client = this.getMercadoPagoClient();
      const preference = new Preference(client);

      // Prepare items for MercadoPago
      const items = order.items.map(item => ({
        id: item.sku || item.product.toString(),
        title: item.productName,
        quantity: item.quantity,
        unit_price: parseFloat(item.unitPrice),
        currency_id: order.currency,
      }));

      // Add shipping as item if cost > 0
      if (order.shipping?.cost > 0) {
        items.push({
          id: 'shipping',
          title: 'Envío',
          quantity: 1,
          unit_price: parseFloat(order.shipping.cost),
          currency_id: order.currency,
        });
      }

      const preferenceData = {
        items,
        payer: {
          name: order.customer.firstName,
          surname: order.customer.lastName,
          email: order.customer.email,
          phone: {
            number: order.customer.phone,
          },
          address: {
            street_name: order.customer.address.street,
            street_number: order.customer.address.streetNumber || '',
            zip_code: order.customer.address.zipCode,
          },
        },
        back_urls: {
          success: `${process.env.CLIENT_URL}/checkout/success?order=${order.orderNumber}`,
          failure: `${process.env.CLIENT_URL}/checkout/failure?order=${order.orderNumber}`,
          pending: `${process.env.CLIENT_URL}/checkout/pending?order=${order.orderNumber}`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.STRAPI_URL || 'http://localhost:1337'}/api/webhooks/mercadopago`,
        external_reference: order.orderNumber,
        statement_descriptor: 'MUEBLES ARTESANALES',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      const response = await preference.create({ body: preferenceData });

      return {
        preferenceId: response.id,
        paymentUrl: response.init_point,
        sandboxUrl: response.sandbox_init_point,
      };
    } catch (error) {
      console.error('Error creating MercadoPago preference:', error);
      throw new Error('Failed to create payment preference');
    }
  },

  // Process MercadoPago webhook
  async processMercadoPagoWebhook(paymentData) {
    try {
      const { external_reference, status, id } = paymentData;
      
      if (!external_reference) {
        console.log('No external reference in payment data');
        return;
      }

      // Find order by order number
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: { orderNumber: external_reference },
        populate: {
          items: {
            populate: { product: true },
          },
          customer: true,
        },
      });

      if (!orders || orders.length === 0) {
        console.log(`Order not found: ${external_reference}`);
        return;
      }

      const order = orders[0];
      let newStatus = order.status;
      let paymentStatus = order.paymentStatus;
      let updateData = {
        mercadopagoId: id.toString(),
      };

      switch (status) {
        case 'approved':
          newStatus = 'paid';
          paymentStatus = 'paid';
          updateData.paidAt = new Date();
          updateData.status = newStatus;
          updateData.paymentStatus = paymentStatus;
          
          // Reduce stock
          await this.reduceStock(order);
          break;
          
        case 'pending':
          paymentStatus = 'pending';
          updateData.paymentStatus = paymentStatus;
          break;
          
        case 'rejected':
        case 'cancelled':
          newStatus = 'cancelled';
          paymentStatus = 'failed';
          updateData.status = newStatus;
          updateData.paymentStatus = paymentStatus;
          updateData.cancelledAt = new Date();
          break;
          
        case 'refunded':
          newStatus = 'refunded';
          paymentStatus = 'refunded';
          updateData.status = newStatus;
          updateData.paymentStatus = paymentStatus;
          updateData.refundedAt = new Date();
          
          // Restore stock
          await this.restoreStock(order);
          break;
      }

      // Update order
      const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
        data: updateData,
        populate: {
          items: true,
          customer: true,
        },
      });

      // Send notification email
      if (status === 'approved') {
        await this.sendOrderConfirmationEmail(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error processing MercadoPago webhook:', error);
      throw error;
    }
  },

  // Reduce product stock
  async reduceStock(order) {
    for (const item of order.items) {
      const product = await strapi.entityService.findOne('api::product.product', item.product.id || item.product);
      
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await strapi.entityService.update('api::product.product', product.id, {
          data: { stock: newStock },
        });
      }
    }
  },

  // Restore product stock
  async restoreStock(order) {
    for (const item of order.items) {
      const product = await strapi.entityService.findOne('api::product.product', item.product.id || item.product);
      
      if (product) {
        const newStock = product.stock + item.quantity;
        await strapi.entityService.update('api::product.product', product.id, {
          data: { stock: newStock },
        });
      }
    }
  },

  // Send order confirmation email
  async sendOrderConfirmationEmail(order) {
    try {
      const emailTemplate = `
        <h1>¡Gracias por tu compra!</h1>
        <p>Hola ${order.customer.firstName},</p>
        <p>Tu pedido <strong>#${order.orderNumber}</strong> ha sido confirmado y pagado exitosamente.</p>
        
        <h2>Detalles del pedido:</h2>
        <ul>
          ${order.items.map(item => `
            <li>${item.productName} x${item.quantity} - $${item.totalPrice}</li>
          `).join('')}
        </ul>
        
        <p><strong>Total: $${order.total}</strong></p>
        
        <p>Te notificaremos cuando tu pedido sea enviado.</p>
        
        <p>¡Gracias por elegir Muebles Artesanales!</p>
      `;

      await strapi.plugins['email'].services.email.send({
        to: order.customer.email,
        subject: `Pedido confirmado #${order.orderNumber}`,
        html: emailTemplate,
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  },

  // Send order status notification
  async sendOrderStatusNotification(order) {
    try {
      let subject = '';
      let message = '';

      switch (order.status) {
        case 'shipped':
          subject = `Tu pedido #${order.orderNumber} ha sido enviado`;
          message = `
            <p>¡Buenas noticias! Tu pedido ha sido enviado.</p>
            ${order.trackingNumber ? `<p>Número de seguimiento: <strong>${order.trackingNumber}</strong></p>` : ''}
            <p>Recibirás tu pedido en los próximos días.</p>
          `;
          break;
          
        case 'delivered':
          subject = `Tu pedido #${order.orderNumber} ha sido entregado`;
          message = `
            <p>¡Tu pedido ha sido entregado exitosamente!</p>
            <p>Esperamos que disfrutes tus muebles artesanales.</p>
            <p>Si tienes alguna consulta, no dudes en contactarnos.</p>
          `;
          break;
          
        case 'cancelled':
          subject = `Tu pedido #${order.orderNumber} ha sido cancelado`;
          message = `
            <p>Tu pedido ha sido cancelado.</p>
            <p>Si realizaste el pago, será reembolsado en los próximos días hábiles.</p>
            <p>Si tienes consultas, contáctanos.</p>
          `;
          break;
      }

      if (subject && message) {
        await strapi.plugins['email'].services.email.send({
          to: order.customer.email,
          subject,
          html: `
            <h1>Actualización de tu pedido</h1>
            <p>Hola ${order.customer.firstName},</p>
            ${message}
            <p>Pedido: <strong>#${order.orderNumber}</strong></p>
            <p>¡Gracias por elegir Muebles Artesanales!</p>
          `,
        });
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  },

  // Send order cancellation notification
  async sendOrderCancellationNotification(order) {
    await this.sendOrderStatusNotification(order);
  },

  // Get order statistics
  async getOrderStatistics() {
    const totalOrders = await strapi.entityService.count('api::order.order');
    
    const paidOrders = await strapi.entityService.count('api::order.order', {
      filters: { paymentStatus: 'paid' },
    });

    const pendingOrders = await strapi.entityService.count('api::order.order', {
      filters: { status: 'pending' },
    });

    const shippedOrders = await strapi.entityService.count('api::order.order', {
      filters: { status: 'shipped' },
    });

    // Calculate total revenue
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { paymentStatus: 'paid' },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    // Calculate average order value
    const averageOrderValue = paidOrders > 0 ? totalRevenue / paidOrders : 0;

    // Get monthly stats
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyOrders = await strapi.entityService.count('api::order.order', {
      filters: {
        createdAt: { $gte: firstDayOfMonth.toISOString() },
      },
    });

    const monthlyRevenue = await strapi.entityService.findMany('api::order.order', {
      filters: {
        paymentStatus: 'paid',
        createdAt: { $gte: firstDayOfMonth.toISOString() },
      },
    });

    const monthlyRevenueTotal = monthlyRevenue.reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalOrders,
      paidOrders,
      pendingOrders,
      shippedOrders,
      totalRevenue,
      averageOrderValue,
      monthlyOrders,
      monthlyRevenue: monthlyRevenueTotal,
    };
  },
}));
