'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  // Create order and process payment
  async create(ctx) {
    const { data } = ctx.request.body;

    try {
      // Validate items and calculate totals
      const validatedOrder = await strapi.service('api::order.order').validateOrder(data);
      
      // Generate order number
      const orderNumber = await strapi.service('api::order.order').generateOrderNumber();
      
      // Create order
      const order = await strapi.entityService.create('api::order.order', {
        data: {
          ...validatedOrder,
          orderNumber,
          status: 'pending',
          paymentStatus: 'pending',
        },
        populate: {
          items: true,
          customer: true,
          shipping: true,
        },
      });

      // Create MercadoPago preference
      if (data.paymentMethod === 'mercadopago' || !data.paymentMethod) {
        const paymentData = await strapi.service('api::order.order').createMercadoPagoPreference(order);
        
        // Update order with payment info
        const updatedOrder = await strapi.entityService.update('api::order.order', order.id, {
          data: {
            mercadopagoPreferenceId: paymentData.preferenceId,
            paymentUrl: paymentData.paymentUrl,
          },
          populate: {
            items: true,
            customer: true,
            shipping: true,
          },
        });

        const sanitizedEntity = await this.sanitizeOutput(updatedOrder, ctx);
        return this.transformResponse(sanitizedEntity);
      }

      const sanitizedEntity = await this.sanitizeOutput(order, ctx);
      return this.transformResponse(sanitizedEntity);

    } catch (error) {
      console.error('Error creating order:', error);
      return ctx.badRequest(error.message);
    }
  },

  // Get order by order number
  async findByOrderNumber(ctx) {
    const { orderNumber } = ctx.params;

    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: { orderNumber },
      populate: {
        items: {
          populate: {
            product: {
              populate: {
                images: true,
              },
            },
          },
        },
        customer: true,
        shipping: true,
        billing: true,
      },
    });

    if (!orders || orders.length === 0) {
      return ctx.notFound('Order not found');
    }

    const sanitizedEntity = await this.sanitizeOutput(orders[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Update order status
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status, adminNotes, trackingNumber } = ctx.request.body;

    const validStatuses = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
      return ctx.badRequest('Invalid status');
    }

    const updateData = { status };
    
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    // Add timestamps based on status
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const order = await strapi.entityService.update('api::order.order', id, {
      data: updateData,
      populate: {
        items: true,
        customer: true,
        shipping: true,
      },
    });

    // Send notification email based on status
    await strapi.service('api::order.order').sendOrderStatusNotification(order);

    const sanitizedEntity = await this.sanitizeOutput(order, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Get order statistics (admin only)
  async getStatistics(ctx) {
    const stats = await strapi.service('api::order.order').getOrderStatistics();
    return ctx.send(stats);
  },

  // Cancel order
  async cancel(ctx) {
    const { id } = ctx.params;
    const { reason } = ctx.request.body;

    const order = await strapi.entityService.findOne('api::order.order', id);
    
    if (!order) {
      return ctx.notFound('Order not found');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return ctx.badRequest('Order cannot be cancelled in current status');
    }

    const updatedOrder = await strapi.entityService.update('api::order.order', id, {
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      populate: {
        items: true,
        customer: true,
      },
    });

    // Restore stock
    await strapi.service('api::order.order').restoreStock(updatedOrder);

    // Send cancellation notification
    await strapi.service('api::order.order').sendOrderCancellationNotification(updatedOrder);

    const sanitizedEntity = await this.sanitizeOutput(updatedOrder, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
