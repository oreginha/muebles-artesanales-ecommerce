'use strict';

/**
 * order router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::order.order');

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
    path: '/orders/number/:orderNumber',
    handler: 'api::order.order.findByOrderNumber',
    config: {
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/orders/:id/status',
    handler: 'api::order.order.updateStatus',
    config: {
      policies: ['admin::is-authenticated'],
    },
  },
  {
    method: 'GET',
    path: '/orders/statistics',
    handler: 'api::order.order.getStatistics',
    config: {
      policies: ['admin::is-authenticated'],
    },
  },
  {
    method: 'PUT',
    path: '/orders/:id/cancel',
    handler: 'api::order.order.cancel',
    config: {
      auth: false,
    },
  },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);
