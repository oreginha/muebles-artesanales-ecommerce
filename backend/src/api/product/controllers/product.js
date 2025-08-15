'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  // Override default find method to include popular queries
  async find(ctx) {
    const { query } = ctx;

    // Add default population
    if (!query.populate) {
      query.populate = {
        category: true,
        images: true,
        tags: true,
      };
    }

    // Add default filters for published content
    if (!query.filters) {
      query.filters = {};
    }
    
    if (!query.filters.publishedAt) {
      query.filters.publishedAt = { $notNull: true };
    }

    const entity = await strapi.entityService.findMany('api::product.product', query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Override findOne to include full population
  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    // Full population for single product
    if (!query.populate) {
      query.populate = {
        category: true,
        images: true,
        gallery: true,
        tags: true,
        specifications: true,
      };
    }

    const entity = await strapi.entityService.findOne('api::product.product', id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Custom method to find by slug
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const { query } = ctx;

    // Full population for single product
    if (!query.populate) {
      query.populate = {
        category: true,
        images: true,
        gallery: true,
        tags: true,
        specifications: true,
      };
    }

    const entity = await strapi.entityService.findMany('api::product.product', {
      ...query,
      filters: {
        ...query.filters,
        slug: slug,
        publishedAt: { $notNull: true },
      },
    });

    if (!entity || entity.length === 0) {
      return ctx.notFound('Product not found');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Get featured products
  async findFeatured(ctx) {
    const { query } = ctx;

    const entity = await strapi.entityService.findMany('api::product.product', {
      ...query,
      filters: {
        ...query.filters,
        featured: true,
        publishedAt: { $notNull: true },
      },
      populate: {
        category: true,
        images: true,
        tags: true,
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Search products
  async search(ctx) {
    const { q, category, minPrice, maxPrice, inStock } = ctx.query;
    let filters = {
      publishedAt: { $notNull: true },
    };

    // Text search
    if (q) {
      filters.$or = [
        { name: { $containsi: q } },
        { description: { $containsi: q } },
        { shortDescription: { $containsi: q } },
      ];
    }

    // Category filter
    if (category) {
      filters.category = {
        slug: category,
      };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filters.stock = { $gt: 0 };
    }

    const entity = await strapi.entityService.findMany('api::product.product', {
      filters,
      populate: {
        category: true,
        images: true,
        tags: true,
      },
      sort: { createdAt: 'desc' },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Update stock
  async updateStock(ctx) {
    const { id } = ctx.params;
    const { stock, operation } = ctx.request.body;

    if (!['set', 'add', 'subtract'].includes(operation)) {
      return ctx.badRequest('Invalid operation. Use: set, add, or subtract');
    }

    const product = await strapi.entityService.findOne('api::product.product', id);
    
    if (!product) {
      return ctx.notFound('Product not found');
    }

    let newStock;
    switch (operation) {
      case 'set':
        newStock = stock;
        break;
      case 'add':
        newStock = product.stock + stock;
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - stock);
        break;
    }

    const updatedProduct = await strapi.entityService.update('api::product.product', id, {
      data: { stock: newStock },
      populate: {
        category: true,
        images: true,
      },
    });

    const sanitizedEntity = await this.sanitizeOutput(updatedProduct, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
