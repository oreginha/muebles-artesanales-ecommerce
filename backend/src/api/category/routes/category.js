'use strict';

/**
 * category router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::category.category');

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
    path: '/categories/featured',
    handler: 'api::category.category.findFeatured',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/categories/tree',
    handler: 'api::category.category.getTree',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/categories/with-count',
    handler: 'api::category.category.getWithProductCount',
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/categories/slug/:slug',
    handler: 'api::category.category.findBySlug',
    config: {
      auth: false,
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
