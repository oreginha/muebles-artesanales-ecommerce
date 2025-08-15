# Plan de Desarrollo - E-commerce Muebles Artesanales

## 📋 Resumen Ejecutivo

E-commerce para venta de muebles artesanales hechos con madera de palets y reciclada, con enfoque en sostenibilidad y productos únicos.

### Stack Tecnológico
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Strapi 4 + PostgreSQL
- **Pagos**: MercadoPago
- **Imágenes**: Cloudinary
- **Despliegue**: Vercel (Frontend) + Railway (Backend/DB)

---

## 🚀 Fases de Desarrollo

### Fase 1: MVP (Minimum Viable Product) - 2-3 semanas

#### Objetivos
- Catálogo básico de productos
- Carrito de compras funcional
- Integración básica con MercadoPago
- Panel de administración básico

#### Entregables
1. **Frontend básico**
   - Homepage con productos destacados
   - Página de producto individual
   - Carrito de compras
   - Checkout con MercadoPago

2. **Backend básico**
   - API de productos
   - Gestión de órdenes
   - Panel admin de Strapi

3. **Integración MercadoPago**
   - Configurar credenciales
   - Implementar webhooks
   - Probar flujo de pago

4. **Configurar Base de Datos**
   - Setup PostgreSQL local
   - Configurar Railway para producción
   - Crear migraciones iniciales

---

## 🔄 Metodología de Desarrollo

### Principios de Desarrollo
- **Mobile First**: Diseño responsive desde el inicio
- **SEO First**: Optimización desde la primera línea de código
- **Performance First**: Lazy loading, optimización de imágenes
- **Security First**: Validación en cliente y servidor
- **User Experience First**: Flujo de compra optimizado

### Estándares de Código
- **TypeScript** estricto en todo el proyecto
- **ESLint + Prettier** para consistencia
- **Conventional Commits** para historial claro
- **Testing** unitario y de integración
- **Documentación** inline y externa

---

## 🧪 Testing Strategy

### Frontend Testing
```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/product/ProductCard';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const mockProduct = {
      id: 1,
      name: 'Mesa Rustica',
      price: 25000,
      image: '/test-image.jpg'
    };
    
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Mesa Rustica')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
  });
});
```

### Backend Testing
```javascript
// tests/product/product.test.js
const request = require('supertest');

describe('Product API', () => {
  it('should return all products', async () => {
    const response = await request(strapi.server.httpServer)
      .get('/api/products')
      .expect(200);
      
    expect(response.body.data).toHaveLength(expect.any(Number));
  });
});
```

### E2E Testing
```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  await page.goto('/productos');
  await page.click('[data-testid="product-card"]:first-child');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-button"]');
  await page.click('[data-testid="checkout-button"]');
  
  // Fill checkout form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="firstName"]', 'Juan');
  await page.fill('[name="lastName"]', 'Pérez');
  
  await page.click('[data-testid="pay-button"]');
  
  // Should redirect to MercadoPago
  await expect(page).toHaveURL(/mercadopago/);
});
```

---

## 🎨 Design System & UI Components

### Color Palette
```css
:root {
  /* Primary Colors - Earth tones for furniture */
  --color-primary-50: #faf7f0;
  --color-primary-100: #f4ede1;
  --color-primary-500: #8b7355;
  --color-primary-600: #6b5742;
  --color-primary-900: #3d3020;
  
  /* Secondary Colors - Green for sustainability */
  --color-secondary-50: #f0fdf4;
  --color-secondary-500: #22c55e;
  --color-secondary-600: #16a34a;
  
  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;
}
```

### Typography Scale
```css
/* Font Family */
font-family: 'Inter', sans-serif; /* Clean, modern */
font-family: 'Playfair Display', serif; /* Elegant headings */

/* Type Scale */
.text-xs    { font-size: 0.75rem; }   /* 12px */
.text-sm    { font-size: 0.875rem; }  /* 14px */
.text-base  { font-size: 1rem; }      /* 16px */
.text-lg    { font-size: 1.125rem; }  /* 18px */
.text-xl    { font-size: 1.25rem; }   /* 20px */
.text-2xl   { font-size: 1.5rem; }    /* 24px */
.text-3xl   { font-size: 1.875rem; }  /* 30px */
.text-4xl   { font-size: 2.25rem; }   /* 36px */
```

### Component Library Structure
```
components/
├── ui/                    # Base components
│   ├── Button.tsx         # Primary, secondary, ghost variants
│   ├── Input.tsx          # Text, email, password inputs
│   ├── Card.tsx           # Product cards, info cards
│   ├── Badge.tsx          # Status badges, categories
│   ├── Modal.tsx          # Modals and dialogs
│   └── Toast.tsx          # Notifications
├── layout/                # Layout components
│   ├── Header.tsx         # Site header with navigation
│   ├── Footer.tsx         # Site footer
│   ├── Sidebar.tsx        # Mobile sidebar
│   └── Container.tsx      # Max-width container
├── product/               # Product-specific
│   ├── ProductCard.tsx    # Product preview card
│   ├── ProductGrid.tsx    # Grid layout for products
│   ├── ProductImages.tsx  # Image gallery with zoom
│   ├── ProductDetails.tsx # Product information
│   └── ProductReviews.tsx # Reviews and ratings
├── cart/                  # Shopping cart
│   ├── CartItem.tsx       # Individual cart item
│   ├── CartSummary.tsx    # Cart totals and actions
│   ├── CartDrawer.tsx     # Slide-out cart
│   └── MiniCart.tsx       # Header cart icon
└── forms/                 # Form components
    ├── CheckoutForm.tsx   # Complete checkout form
    ├── ContactForm.tsx    # Contact/support form
    ├── NewsletterForm.tsx # Email subscription
    └── SearchForm.tsx     # Product search
```

---

## 📱 Progressive Web App (PWA)

### PWA Configuration
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withPWA({
  // Next.js config
});
```

### Manifest.json
```json
{
  "name": "Muebles Artesanales",
  "short_name": "MueblesArt",
  "description": "Muebles hechos a mano con madera reciclada",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf7f0",
  "theme_color": "#8b7355",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔍 SEO Strategy

### Technical SEO Checklist
- ✅ **Semantic HTML** structure
- ✅ **Meta tags** dinámicos por página
- ✅ **Open Graph** y Twitter Cards
- ✅ **Structured Data** (JSON-LD)
- ✅ **XML Sitemap** automático
- ✅ **Robots.txt** optimizado
- ✅ **Canonical URLs** correctas
- ✅ **Alt text** en todas las imágenes

### Content SEO Strategy
- **Keywords principales**: "muebles artesanales", "muebles reciclados", "muebles palets"
- **Long-tail keywords**: "mesa rustica madera reciclada", "muebles sustentables argentina"
- **Blog content**: "Cómo cuidar muebles de madera", "Beneficios de muebles reciclados"
- **Local SEO**: "muebles artesanales [ciudad]", "carpintería [región]"

### Performance Optimization
```typescript
// Image optimization
import Image from 'next/image';

<Image
  src="/productos/mesa-rustica.jpg"
  alt="Mesa rústica de madera reciclada"
  width={400}
  height={300}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

---

## 🛒 E-commerce Features

### Core Shopping Features
1. **Product Catalog**
   - Category filtering
   - Price range filtering
   - Search functionality
   - Sort options (price, date, popularity)

2. **Shopping Cart**
   - Add/remove items
   - Quantity adjustment
   - Save for later
   - Persistent across sessions

3. **Checkout Process**
   - Guest checkout option
   - Multiple payment methods
   - Shipping calculation
   - Order confirmation

4. **User Account** (Future phase)
   - Order history
   - Wishlist
   - Address book
   - Loyalty points

### Advanced Features (Phase 2+)
- **Inventory Management**
  - Real-time stock updates
  - Low stock notifications
  - Backorder handling

- **Promotional Tools**
  - Discount codes
  - Bundle offers
  - Seasonal sales

- **Analytics & Insights**
  - Sales reporting
  - Customer behavior
  - Product performance

---

## 📊 Business Intelligence & Analytics

### Key Metrics to Track
1. **Sales Metrics**
   - Revenue per month/quarter
   - Average order value (AOV)
   - Conversion rate
   - Cart abandonment rate

2. **Product Metrics**
   - Best-selling products
   - Product page views
   - Add-to-cart rate
   - Stock turnover

3. **Customer Metrics**
   - New vs returning customers
   - Customer lifetime value (CLV)
   - Geographic distribution
   - Device usage patterns

### Analytics Implementation
```typescript
// Google Analytics 4 setup
import { GoogleAnalytics } from 'nextjs-google-analytics';

// Track e-commerce events
const trackPurchase = (orderId: string, value: number, items: any[]) => {
  gtag('event', 'purchase', {
    transaction_id: orderId,
    value: value,
    currency: 'ARS',
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price
    }))
  });
};
```

---

## 🔐 Security Considerations

### Frontend Security
- **Content Security Policy (CSP)**
- **XSS Protection** via sanitization
- **HTTPS Enforcement**
- **Secure Cookie Settings**

### Backend Security
- **Rate Limiting** on API endpoints
- **Input Validation** and sanitization
- **SQL Injection Prevention**
- **JWT Token Security**
- **CORS Configuration**

### PCI Compliance
- **No card data storage** (MercadoPago handles this)
- **Secure payment redirect**
- **Webhook signature verification**

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

---

## 🌐 Internationalization (Future)

### Multi-language Support
- **Spanish** (primary)
- **English** (secondary)
- **Portuguese** (for Brazilian market)

### Currency Support
- **ARS** (Argentine Peso) - Primary
- **USD** (US Dollar) - Secondary
- **BRL** (Brazilian Real) - Future

### Regional Adaptations
- **Shipping zones** and costs
- **Tax calculations** by region
- **Payment method** availability
- **Legal compliance** per country

---

## 📞 Customer Support Integration

### Support Channels
1. **WhatsApp Business API**
   - Product inquiries
   - Order status
   - Custom requests

2. **Contact Forms**
   - General inquiries
   - Technical support
   - Bulk orders

3. **FAQ Section**
   - Common questions
   - Care instructions
   - Shipping information

4. **Live Chat** (Future)
   - Real-time support
   - Sales assistance

---

## 🚀 Deployment & DevOps

### Environment Setup
```bash
# Development
npm run dev

# Staging
npm run build:staging
npm run deploy:staging

# Production
npm run build:production
npm run deploy:production
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:frontend
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build:backend
      - name: Deploy to Railway
        run: railway deploy
```

### Monitoring & Alerting
- **Uptime monitoring** (Pingdom/UptimeRobot)
- **Performance monitoring** (Vercel Analytics)
- **Error tracking** (Sentry)
- **Log aggregation** (Railway logs)

---

## 💡 Future Enhancements

### Phase 4: Mobile App
- **React Native** app using same Strapi API
- **Push notifications** for orders
- **Offline catalog** viewing
- **Camera integration** for AR preview

### Phase 5: AI Integration
- **Product recommendations** ML model
- **Chatbot** for customer service
- **Image recognition** for similar products
- **Demand forecasting**

### Phase 6: Marketplace
- **Multi-vendor** support
- **Artisan profiles**
- **Commission system**
- **Rating and review** system

---

## 📋 Development Checklist

### MVP Phase ✅
- [x] Project structure created
- [x] GitHub repository setup
- [ ] Strapi backend configuration
- [ ] Next.js frontend setup
- [ ] Basic product catalog
- [ ] Shopping cart functionality
- [ ] MercadoPago integration
- [ ] Order management

### Phase 2 🚧
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Advanced filtering
- [ ] User reviews system
- [ ] Email notifications
- [ ] Admin dashboard enhancements

### Phase 3 📋
- [ ] Mobile responsiveness testing
- [ ] PWA implementation
- [ ] Analytics integration
- [ ] Social media automation
- [ ] Advanced reporting
- [ ] Customer support system

---

## 🤝 Team Collaboration

### Roles & Responsibilities
- **Full-Stack Developer**: Architecture, implementation, deployment
- **UI/UX Designer**: Design system, user experience
- **Content Manager**: Product descriptions, SEO content
- **Business Owner**: Requirements, testing, feedback

### Communication Tools
- **GitHub Issues** for task management
- **GitHub Projects** for sprint planning
- **Slack/Discord** for real-time communication
- **Figma** for design collaboration

---

## 📚 Resources & Documentation

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [MercadoPago Developers](https://www.mercadopago.com.ar/developers)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Learning Resources
- [E-commerce Best Practices](https://web.dev/ecommerce-best-practices/)
- [Next.js E-commerce Tutorial](https://nextjs.org/learn)
- [Strapi E-commerce](https://strapi.io/blog/how-to-build-an-e-commerce-website-with-strapi-and-next-js)

### Tools & Extensions
- **VS Code Extensions**: ES7+ React snippets, Tailwind IntelliSense
- **Browser Extensions**: React DevTools, Lighthouse
- **Design Tools**: Figma, Adobe Creative Suite

---

## 🎯 Success Metrics

### Technical KPIs
- **Page Load Speed**: < 3 seconds
- **Core Web Vitals**: All green scores
- **Uptime**: > 99.9%
- **Mobile Performance**: > 90 Lighthouse score

### Business KPIs
- **Conversion Rate**: > 2%
- **Average Order Value**: Target amount
- **Customer Acquisition Cost**: Optimize
- **Return Customer Rate**: > 30%

### Timeline Milestones
- **Week 2**: MVP deployed to staging
- **Week 4**: Production launch
- **Week 8**: First phase optimizations complete
- **Week 12**: Advanced features deployed

---

**¡Proyecto iniciado exitosamente! 🚀**

Repositorio: https://github.com/oreginha/muebles-artesanales-ecommerce

**Próximo paso: Configurar el backend con Strapi**ración de pagos**
   - MercadoPago Checkout Pro
   - Webhooks básicos

### Fase 2: Funcionalidades Avanzadas - 3-4 semanas

#### Objetivos
- SEO optimizado
- Sistema de categorías
- Gestión avanzada de inventario
- Optimización de rendimiento

#### Entregables
1. **SEO y Performance**
   - Meta tags dinámicos
   - Structured data
   - Sitemap automático
   - Optimización de imágenes

2. **Funcionalidades avanzadas**
   - Búsqueda y filtros
   - Wishlist
   - Sistema de reviews
   - Notificaciones de stock

### Fase 3: Escalabilidad - 2-3 semanas

#### Objetivos
- Preparación para app móvil
- Automatización de redes sociales
- Analytics avanzados
- Sistema de cupones

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
Frontend (Next.js) <---> Strapi API <---> PostgreSQL
                    \
                     \--> MercadoPago API
                     \--> Cloudinary API
```

### Estructura de Carpetas

```
muebles-artesanales-ecommerce/
├── frontend/
│   ├── app/                    # App Router (Next.js 14)
│   │   ├── (shop)/            # Grupo de rutas de tienda
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── productos/     # Catálogo
│   │   │   ├── carrito/       # Carrito
│   │   │   └── checkout/      # Proceso de pago
│   │   ├── admin/             # Panel admin (opcional)
│   │   ├── api/               # API routes
│   │   └── globals.css        # Estilos globales
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Input, etc.)
│   │   ├── layout/            # Header, Footer, Navigation
│   │   ├── product/           # ProductCard, ProductGrid, etc.
│   │   ├── cart/              # CartItem, CartSummary, etc.
│   │   └── forms/             # CheckoutForm, ContactForm, etc.
│   ├── lib/
│   │   ├── strapi.ts          # Cliente Strapi
│   │   ├── mercadopago.ts     # Cliente MercadoPago
│   │   ├── utils.ts           # Utilidades
│   │   └── validations.ts     # Esquemas de validación
│   ├── types/                 # Definiciones TypeScript
│   ├── hooks/                 # Custom hooks
│   └── styles/                # Estilos adicionales
├── backend/                   # Strapi
│   ├── config/
│   ├── src/
│   │   ├── api/
│   │   │   ├── product/       # Modelo de productos
│   │   │   ├── category/      # Categorías
│   │   │   ├── order/         # Órdenes
│   │   │   └── customer/      # Clientes
│   │   ├── components/        # Componentes reutilizables
│   │   ├── extensions/        # Extensiones de Strapi
│   │   └── middlewares/       # Middlewares custom
│   └── database/
├── docs/
│   ├── api.md                 # Documentación de API
│   ├── deployment.md          # Guía de despliegue
│   └── development.md         # Guía de desarrollo
└── scripts/
    ├── setup-env.js           # Configuración inicial
    ├── deploy.sh              # Script de despliegue
    └── backup.sh              # Backup de BD
```

---

## 🛠️ Dependencias y Herramientas

### Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "typescript": "^5.5.3",
    "@next/font": "^14.2.5",
    "tailwindcss": "^3.4.6",
    "framer-motion": "^11.3.2",
    "react-hook-form": "^7.52.1",
    "@hookform/resolvers": "^3.7.0",
    "zod": "^3.23.8",
    "mercadopago": "^2.0.11",
    "swr": "^2.2.5",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.408.0",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "next-seo": "^6.5.0",
    "sharp": "^0.33.4"
  },
  "devDependencies": {
    "@types/node": "^20.14.11",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.5",
    "prettier": "^3.3.3",
    "@tailwindcss/typography": "^0.5.13",
    "@tailwindcss/forms": "^0.5.7"
  }
}
```

### Backend Dependencies (Strapi)

```json
{
  "dependencies": {
    "@strapi/strapi": "^4.25.1",
    "@strapi/plugin-users-permissions": "^4.25.1",
    "@strapi/plugin-i18n": "^4.25.1",
    "@strapi/plugin-email": "^4.25.1",
    "@strapi/provider-upload-cloudinary": "^4.25.1",
    "pg": "^8.12.0",
    "mercadopago": "^2.0.11",
    "nodemailer": "^6.9.14",
    "stripe": "^16.2.0"
  }
}
```

---

## 🔧 Configuración e Integración

### 1. MercadoPago Integration

#### Configuración Inicial
```typescript
// lib/mercadopago.ts
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export const mercadopago = {
  preference: new Preference(client),
  // Otros servicios...
};
```

#### Flujo de Pago
1. **Crear preferencia** en el backend
2. **Redirigir a MercadoPago** desde el frontend
3. **Webhook de confirmación** para actualizar orden
4. **Página de éxito/fracaso** con estado final

#### Webhooks de MercadoPago
```typescript
// app/api/webhooks/mercadopago/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  // Verificar firma del webhook
  // Actualizar estado de la orden
  // Enviar confirmación por email
  
  return Response.json({ received: true });
}
```

### 2. SEO Optimization

#### Meta Tags Dinámicos
```typescript
// app/productos/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  return {
    title: `${product.name} - Muebles Artesanales`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}
```

#### Structured Data
```typescript
// components/product/ProductStructuredData.tsx
export default function ProductStructuredData({ product }) {
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "ARS",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 3. Strapi Configuration

#### Content Types
1. **Product**
   - name (Text)
   - description (Rich Text)
   - price (Decimal)
   - images (Media)
   - category (Relation)
   - stock (Integer)
   - slug (UID)

2. **Category**
   - name (Text)
   - description (Text)
   - image (Media)
   - slug (UID)

3. **Order**
   - items (Component)
   - customer (Component)
   - status (Enumeration)
   - total (Decimal)
   - mercadopago_id (Text)

#### Custom Controllers
```javascript
// src/api/order/controllers/order.js
module.exports = {
  async createPayment(ctx) {
    const { items, customer } = ctx.request.body;
    
    // Crear preferencia en MercadoPago
    // Guardar orden en BD
    // Retornar URL de pago
  },
  
  async webhook(ctx) {
    // Procesar webhook de MercadoPago
    // Actualizar estado de orden
  }
};
```

---

## 🔒 Seguridad y Mejores Prácticas

### Variables de Entorno
```bash
# Frontend (.env.local)
NEXT_PUBLIC_STRAPI_API_URL=https://api.muebles.com
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx

# Backend (.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx
MERCADOPAGO_WEBHOOK_SECRET=xxxx
CLOUDINARY_NAME=xxxx
JWT_SECRET=xxxx
```

### Validaciones
```typescript
// lib/validations.ts
import { z } from 'zod';

export const CheckoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(10),
  address: z.object({
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(4),
  }),
});
```

### Sanitización
```typescript
// lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
```

---

## 🚀 Despliegue

### Frontend (Vercel)
1. **Conectar repositorio** en Vercel
2. **Configurar variables de entorno**
3. **Configurar dominios** personalizados
4. **Habilitar Analytics** y Speed Insights

### Backend (Railway)
1. **Crear proyecto** en Railway
2. **Conectar repositorio** (carpeta backend)
3. **Configurar PostgreSQL** addon
4. **Configurar variables de entorno**
5. **Configurar dominio** para API

### Base de Datos
```sql
-- Configuración inicial PostgreSQL
CREATE DATABASE muebles_artesanales;
CREATE USER strapi_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE muebles_artesanales TO strapi_user;
```

---

## 📊 Monitoreo y Analytics

### Performance Monitoring
- **Vercel Analytics** para frontend
- **Railway Metrics** para backend
- **Lighthouse CI** para performance

### Business Analytics
- **Google Analytics 4** para comportamiento
- **MercadoPago Analytics** para ventas
- **Strapi Admin** para gestión de contenido

### Error Tracking
- **Sentry** para errores en producción
- **Console logs** estructurados
- **Health checks** automatizados

---

## 🔄 Flujo de Desarrollo

### Git Workflow
```bash
# Branches principales
main          # Producción
develop       # Desarrollo
feature/*     # Nuevas funcionalidades
hotfix/*      # Correcciones urgentes
```

### CI/CD Pipeline
1. **Push** a feature branch
2. **Tests** automatizados
3. **Review** de código
4. **Merge** a develop
5. **Deploy** automático a staging
6. **Merge** a main para producción

### Comandos de Desarrollo
```bash
# Desarrollo local
npm run dev                 # Ambos servicios
npm run dev:frontend        # Solo frontend
npm run dev:backend         # Solo backend

# Construcción
npm run build              # Ambos servicios
npm run build:frontend     # Solo frontend
npm run build:backend      # Solo backend

# Despliegue
npm run deploy:frontend    # Deploy a Vercel
npm run deploy:backend     # Deploy a Railway
```

---

## 📅 Timeline Estimado

### Semana 1-2: MVP Base
- ✅ Estructura del proyecto
- ⏳ Configuración de Strapi
- ⏳ Frontend básico con Next.js
- ⏳ Integración MercadoPago básica

### Semana 3-4: Funcionalidades Core
- ⏳ Catálogo completo de productos
- ⏳ Carrito y checkout
- ⏳ Panel de administración
- ⏳ Gestión de órdenes

### Semana 5-6: Optimización
- ⏳ SEO completo
- ⏳ Performance optimization
- ⏳ Testing y debugging
- ⏳ Despliegue a producción

### Semana 7-8: Funcionalidades Avanzadas
- ⏳ Sistema de reviews
- ⏳ Wishlist
- ⏳ Notificaciones
- ⏳ Analytics

---

## 🎯 Próximos Pasos Inmediatos

1. **Configurar Strapi** (Backend)
   - Instalar y configurar
   - Crear content types
   - Configurar PostgreSQL

2. **Configurar Next.js** (Frontend)
   - Crear proyecto
   - Configurar Tailwind CSS
   - Implementar layout básico

3. **Integ