'use strict';

/**
 * webhook router
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/webhooks/mercadopago',
      handler: 'api::webhook.webhook.mercadopago',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
