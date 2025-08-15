# Documentación de API - Muebles Artesanales E-commerce

## Base URL
- **Desarrollo**: `http://localhost:1337/api`
- **Producción**: `https://your-backend.railway.app/api`

## Autenticación

### Admin API Token
```bash
Authorization: Bearer your-api-token
```

### Usuario JWT
```bash
Authorization: Bearer jwt-token
```

## Endpoints

### Products

#### GET /products
Obtener lista de productos

**Query Parameters:**
- `populate=*` - Incluir relaciones
- `filters[category][slug][$eq]=mesas` - Filtrar por categoría
- `filters[price][$gte]=1000` - Precio mínimo
- `filters[price][$lte]=5000` - Precio máximo
- `sort=price:asc` - Ordenar por precio ascendente
- `pagination[page]=1` - Página
- `pagination[pageSize]=10` - Elementos por página

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Mesa Rústica",
        "description": "Mesa hecha con madera de palets reciclados",
        "price": 25000,
        "stock": 5,
        "slug": "mesa-rustica",
        "featured": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "category": {
          "data": {
            "id": 1,
            "attributes": {
              "name": "Mesas",
              "slug": "mesas"
            }
          }
        },
        "images": {
          "data": [
            {
              "id": 1,
              "attributes": {
                "url": "/uploads/mesa_rustica_1.jpg",
                "alternativeText": "Mesa rústica vista frontal"
              }
            }
          ]
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### GET /products/:id
Obtener producto específico

**Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Mesa Rústica",
      "description": "Mesa hecha con madera de palets reciclados",
      "price": 25000,
      "stock": 5,
      "slug": "mesa-rustica",
      "specifications": [
        {
          "id": 1,
          "key": "Material",
          "value": "Madera de palet reciclada"
        },
        {
          "id": 2,
          "key": "Dimensiones",
          "value": "120cm x 80cm x 75cm"
        }
      ],
      "category": {
        "data": {
          "id": 1,
          "attributes": {
            "name": "Mesas",
            "slug": "mesas"
          }
        }
      },
      "images": {
        "data": [
          {
            "id": 1,
            "attributes": {
              "url": "/uploads/mesa_rustica_1.jpg",
              "alternativeText": "Mesa rústica vista frontal"
            }
          }
        ]
      }
    }
  }
}
```

#### GET /products/slug/:slug
Obtener producto por slug

**Response:** Igual que GET /products/:id

### Categories

#### GET /categories
Obtener lista de categorías

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Mesas",
        "slug": "mesas",
        "description": "Mesas de diferentes estilos y tamaños",
        "image": {
          "data": {
            "id": 1,
            "attributes": {
              "url": "/uploads/category_mesas.jpg"
            }
          }
        }
      }
    }
  ]
}
```

#### GET /categories/:id
Obtener categoría específica con productos

**Query Parameters:**
- `populate=products.images` - Incluir productos con imágenes

**Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "Mesas",
      "slug": "mesas",
      "description": "Mesas de diferentes estilos y tamaños",
      "products": {
        "data": [
          {
            "id": 1,
            "attributes": {
              "name": "Mesa Rústica",
              "price": 25000,
              "slug": "mesa-rustica",
              "images": {
                "data": [...]
              }
            }
          }
        ]
      }
    }
  }
}
```

### Orders

#### POST /orders
Crear nueva orden

**Request:**
```json
{
  "data": {
    "items": [
      {
        "product": 1,
        "quantity": 2,
        "price": 25000
      }
    ],
    "customer": {
      "email": "cliente@example.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "phone": "+5491123456789",
      "address": {
        "street": "Av. Corrientes 1234",
        "city": "Buenos Aires",
        "state": "CABA",
        "zipCode": "1043",
        "country": "Argentina"
      }
    },
    "shipping": {
      "method": "delivery",
      "cost": 2500
    },
    "total": 52500,
    "currency": "ARS"
  }
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "orderNumber": "ORD-2024-001",
      "status": "pending",
      "total": 52500,
      "currency": "ARS",
      "paymentUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxx",
      "items": [...],
      "customer": {...},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /orders/:id
Obtener orden específica

**Response:**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "orderNumber": "ORD-2024-001",
      "status": "paid",
      "total": 52500,
      "currency": "ARS",
      "mercadopagoId": "12345678",
      "items": [
        {
          "id": 1,
          "product": {
            "data": {
              "id": 1,
              "attributes": {
                "name": "Mesa Rústica",
                "price": 25000
              }
            }
          },
          "quantity": 2,
          "price": 25000,
          "subtotal": 50000
        }
      ],
      "customer": {
        "email": "cliente@example.com",
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "+5491123456789",
        "address": {
          "street": "Av. Corrientes 1234",
          "city": "Buenos Aires",
          "state": "CABA",
          "zipCode": "1043",
          "country": "Argentina"
        }
      },
      "shipping": {
        "method": "delivery",
        "cost": 2500,
        "trackingNumber": "TK123456789"
      },
      "payment": {
        "method": "mercadopago",
        "status": "approved",
        "transactionId": "12345678",
        "paidAt": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### PATCH /orders/:id
Actualizar estado de orden (Admin only)

**Request:**
```json
{
  "data": {
    "status": "shipped",
    "shipping": {
      "trackingNumber": "TK123456789"
    }
  }
}
```

### Payment Webhooks

#### POST /webhooks/mercadopago
Webhook de MercadoPago

**Headers:**
```
Content-Type: application/json
x-signature: signature
x-request-id: request-id
```

**Request:**
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "12345678"
  },
  "date_created": "2024-01-01T00:00:00.000Z",
  "id": 987654321,
  "live_mode": true,
  "type": "payment",
  "user_id": "USER_ID"
}
```

**Response:**
```json
{
  "status": "received"
}
```

### Search

#### GET /search
Búsqueda global

**Query Parameters:**
- `q=mesa` - Término de búsqueda
- `type=products` - Tipo de contenido (products, categories)
- `limit=10` - Límite de resultados

**Response:**
```json
{
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Mesa Rústica",
        "price": 25000,
        "slug": "mesa-rustica",
        "image": "/uploads/mesa_rustica_1.jpg"
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "Mesas",
        "slug": "mesas"
      }
    ]
  },
  "meta": {
    "total": 1,
    "query": "mesa"
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

## Error Response Format

```json
{
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "Invalid data provided",
    "details": {
      "errors": [
        {
          "path": ["email"],
          "message": "Email is required",
          "name": "ValidationError"
        }
      ]
    }
  }
}
```

## Rate Limiting

- **Products**: 100 requests/minute
- **Orders**: 30 requests/minute
- **Search**: 60 requests/minute
- **Webhooks**: Sin límite

## Webhooks Security

### Verificar signature MercadoPago
```javascript
const crypto = require('crypto');

function verifyWebhook(body, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const calculatedSignature = hmac.digest('hex');
  
  return signature === calculatedSignature;
}
```

## Content Types

### Product Content Type
```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product"
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "richtext"
    },
    "price": {
      "type": "decimal",
      "required": true
    },
    "stock": {
      "type": "integer",
      "default": 0
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "featured": {
      "type": "boolean",
      "default": false
    },
    "specifications": {
      "type": "component",
      "repeatable": true,
      "component": "product.specification"
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "products"
    },
    "images": {
      "type": "media",
      "multiple": true,
      "required": false,
      "allowedTypes": ["images"]
    }
  }
}
```

### Order Content Type
```json
{
  "kind": "collectionType",
  "collectionName": "orders",
  "info": {
    "singularName": "order",
    "pluralName": "orders",
    "displayName": "Order"
  },
  "attributes": {
    "orderNumber": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
      "default": "pending"
    },
    "total": {
      "type": "decimal",
      "required": true
    },
    "currency": {
      "type": "string",
      "default": "ARS"
    },
    "mercadopagoId": {
      "type": "string"
    },
    "items": {
      "type": "component",
      "repeatable": true,
      "component": "order.item"
    },
    "customer": {
      "type": "component",
      "component": "order.customer",
      "required": true
    },
    "shipping": {
      "type": "component",
      "component": "order.shipping"
    },
    "payment": {
      "type": "component",
      "component": "order.payment"
    }
  }
}
```

## Ejemplos de Uso

### Obtener productos con filtros
```javascript
const response = await fetch('/api/products?' + new URLSearchParams({
  'populate': '*',
  'filters[category][slug][$eq]': 'mesas',
  'filters[price][$gte]': '1000',
  'filters[price][$lte]': '5000',
  'sort': 'price:asc',
  'pagination[page]': '1',
  'pagination[pageSize]': '12'
}));

const { data, meta } = await response.json();
```

### Crear orden
```javascript
const orderData = {
  data: {
    items: cartItems.map(item => ({
      product: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    customer: customerData,
    shipping: shippingData,
    total: calculateTotal(),
    currency: 'ARS'
  }
};

const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(orderData)
});

const order = await response.json();
```

### Webhook handler
```javascript
// backend/src/api/webhook/controllers/webhook.js
module.exports = {
  async mercadopago(ctx) {
    const signature = ctx.request.headers['x-signature'];
    const body = ctx.request.body;
    
    // Verificar signature
    if (!verifyWebhook(JSON.stringify(body), signature, process.env.MERCADOPAGO_WEBHOOK_SECRET)) {
      return ctx.unauthorized('Invalid signature');
    }
    
    // Procesar webhook
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = await getMercadoPagoPayment(paymentId);
      
      // Actualizar orden
      await updateOrderStatus(payment);
    }
    
    ctx.send({ status: 'received' });
  }
};
```
