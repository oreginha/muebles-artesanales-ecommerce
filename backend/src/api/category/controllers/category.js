'use strict';

/**
 * category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::category.category', ({ strapi }) => ({
  async find(ctx) {
    const { query } = ctx;

    // Add default population
    if (!query.populate) {
      query.populate = {
        image: true,
        parent: true,
        children: {
          populate: {
            image: true,
          },
        },
      };
    }

    // Add default filters for published content
    if (!query.filters) {
      query.filters = {};
    }
    
    if (!query.filters.publishedAt) {
      query.filters.publishedAt = { $notNull: true };
    }

    // Default sorting by sortOrder
    if (!query.sort) {
      query.sort = { sortOrder: 'asc', name: 'asc' };
    }

    const entity = await strapi.entityService.findMany('api::category.category', query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  async findOne(ctx) {
    const { id } = ctx.params;
    const { query } = ctx;

    // Full population for single category
    if (!query.populate) {
      query.populate = {
        image: true,
        parent: true,
        children: {
          populate: {
            image: true,
          },
        },
        products: {
          populate: {
            images: true,
          },
          filters: {
            publishedAt: { $notNull: true },
          },
          sort: { createdAt: 'desc' },
        },
      };
    }

    const entity = await strapi.entityService.findOne('api::category.category', id, query);
    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    return this.transformResponse(sanitizedEntity);
  },

  // Find category by slug
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    const { query } = ctx;

    if (!query.populate) {
      query.populate = {
        image: true,
        parent: true,
        children: {
          populate: {
            image: true,
          },
        },
        products: {
          populate: {
            images: true,
            category: true,
          },
          filters: {
            publishedAt: { $notNull: true },
          },
          sort: { createdAt: 'desc' },
        },
      };
    }

    const entity = await strapi.entityService.findMany('api::category.category', {
      ...query,
      filters: {
        ...query.filters,
        slug: slug,
        publishedAt: { $notNull: true },
      },
    });

    if (!entity || entity.length === 0) {
      return ctx.notFound('Category not found');
    }

    const sanitizedEntity = await this.sanitizeOutput(entity[0], ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Get featured categories
  async findFeatured(ctx) {
    const { query } = ctx;

    const entity = await strapi.entityService.findMany('api::category.category', {
      ...query,
      filters: {
        ...query.filters,
        featured: true,
        publishedAt: { $notNull: true },
      },
      populate: {
        image: true,
        children: {
          populate: {
            image: true,
          },
        },
      },
      sort: { sortOrder: 'asc', name: 'asc' },
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Get category tree (hierarchical structure)
  async getTree(ctx) {
    const { query } = ctx;

    // Get all root categories (no parent)
    const rootCategories = await strapi.entityService.findMany('api::category.category', {
      ...query,
      filters: {
        ...query.filters,
        parent: { $null: true },
        publishedAt: { $notNull: true },
      },
      populate: {
        image: true,
        children: {
          populate: {
            image: true,
            children: {
              populate: {
                image: true,
              },
            },
          },
          filters: {
            publishedAt: { $notNull: true },
          },
          sort: { sortOrder: 'asc', name: 'asc' },
        },
      },
      sort: { sortOrder: 'asc', name: 'asc' },
    });

    const sanitizedEntity = await this.sanitizeOutput(rootCategories, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  // Get products count for each category
  async getWithProductCount(ctx) {
    const categories = await strapi.entityService.findMany('api::category.category', {
      filters: {
        publishedAt: { $notNull: true },
      },
      populate: {
        image: true,
        products: {
          filters: {
            publishedAt: { $notNull: true },
          },
        },
      },
      sort: { sortOrder: 'asc', name: 'asc' },
    });

    // Add product count to each category
    const categoriesWithCount = categories.map(category => ({
      ...category,
      productCount: category.products ? category.products.length : 0,
      products: undefined, // Remove products array to reduce payload
    }));

    const sanitizedEntity = await this.sanitizeOutput(categoriesWithCount, ctx);
    return this.transformResponse(sanitizedEntity);
  },
}));
