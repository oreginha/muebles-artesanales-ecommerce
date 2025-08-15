'use strict';

/**
 * product service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product.product', ({ strapi }) => ({
  // Custom service methods for products

  async findByCategory(categorySlug, options = {}) {
    const products = await strapi.entityService.findMany('api::product.product', {
      ...options,
      filters: {
        ...options.filters,
        category: {
          slug: categorySlug,
        },
        publishedAt: { $notNull: true },
      },
      populate: {
        category: true,
        images: true,
        tags: true,
      },
    });

    return products;
  },

  async findSimilar(productId, limit = 4) {
    // Get the current product to find similar ones
    const currentProduct = await strapi.entityService.findOne('api::product.product', productId, {
      populate: {
        category: true,
        tags: true,
      },
    });

    if (!currentProduct) {
      return [];
    }

    // Find products in the same category, excluding the current product
    const similarProducts = await strapi.entityService.findMany('api::product.product', {
      filters: {
        id: { $ne: productId },
        category: currentProduct.category?.id,
        publishedAt: { $notNull: true },
      },
      populate: {
        category: true,
        images: true,
      },
      limit,
      sort: { createdAt: 'desc' },
    });

    return similarProducts;
  },

  async updateStock(productId, newStock) {
    const product = await strapi.entityService.update('api::product.product', productId, {
      data: { stock: newStock },
    });

    // Trigger low stock notification if needed
    if (newStock <= 5 && newStock > 0) {
      await this.sendLowStockNotification(product);
    }

    return product;
  },

  async sendLowStockNotification(product) {
    // Send email notification to admin about low stock
    try {
      await strapi.plugins['email'].services.email.send({
        to: 'admin@muebles-artesanales.com',
        subject: `Stock bajo: ${product.name}`,
        html: `
          <h2>Alerta de Stock Bajo</h2>
          <p>El producto <strong>${product.name}</strong> tiene stock bajo.</p>
          <p>Stock actual: ${product.stock} unidades</p>
          <p>Se recomienda reponer el inventario pronto.</p>
        `,
      });
    } catch (error) {
      console.error('Error sending low stock notification:', error);
    }
  },

  async generateSKU() {
    // Generate a unique SKU
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MA-${timestamp}-${random}`;
  },

  async beforeCreate(event) {
    const { data } = event.params;
    
    // Auto-generate SKU if not provided
    if (!data.sku) {
      data.sku = await this.generateSKU();
    }

    // Set default availability based on stock
    if (!data.availability) {
      data.availability = data.stock > 0 ? 'in_stock' : 'out_of_stock';
    }
  },

  async afterUpdate(event) {
    const { data, where } = event.params;
    
    // Update availability based on stock changes
    if (data.stock !== undefined) {
      const availability = data.stock > 0 ? 'in_stock' : 'out_of_stock';
      
      if (data.availability !== availability) {
        await strapi.entityService.update('api::product.product', where.id, {
          data: { availability },
        });
      }
    }
  },
}));
