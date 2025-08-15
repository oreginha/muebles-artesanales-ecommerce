'use strict';

/**
 * product router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::product.product');

const customRouter = (innerRouter, extraRoutes = []) => {
  let routes;
  return {
    get prefix() {
      return innerRouter.prefix;
    },
    get routes() {
      if (!routes) routes = innerRouter.routes.concat(extraRoutes);
      return routes;
    },
  };
};

const myExtraRoutes = [
  {
    method: 'GET',
    path: '/products/featured',
    handler: 'api::product.product.findFeatured',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/products/search',
    handler: 'api::product.product.search',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/products/slug/:slug',
    handler: 'api::product.product.findBySlug',
    config: {
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/products/:id/stock',
    handler: 'api::product.product.updateStock',
    config: {
      policies: ['admin::is-authenticated'],
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
