# Muebles Artesanales - E-commerce

E-commerce para venta de muebles hechos a mano con madera de palets y reciclada.

## Tecnologías

### Frontend
- **Next.js 14** - Framework React con SSR/SSG
- **Tailwind CSS** - Estilos utilitarios
- **TypeScript** - Tipado estático
- **Framer Motion** - Animaciones
- **React Hook Form** - Manejo de formularios

### Backend
- **Strapi 4** - Headless CMS
- **PostgreSQL** - Base de datos
- **Cloudinary** - Gestión de imágenes

### Pagos
- **MercadoPago** - Pasarela de pagos

### Despliegue
- **Vercel** - Frontend
- **Railway** - Backend y Base de datos

## Estructura del Proyecto

```
muebles-artesanales-ecommerce/
├── frontend/          # Next.js application
├── backend/           # Strapi CMS
├── docs/             # Documentación
├── scripts/          # Scripts de utilidad
└── README.md
```

## Desarrollo Local

### Prerequisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd muebles-artesanales-ecommerce
```

2. Configurar Backend
```bash
cd backend
npm install
# Configurar variables de entorno
cp .env.example .env
npm run develop
```

3. Configurar Frontend
```bash
cd frontend
npm install
# Configurar variables de entorno
cp .env.example .env.local
npm run dev
```

## Despliegue

### Backend (Railway)
- Base de datos PostgreSQL
- Despliegue automático desde GitHub

### Frontend (Vercel)
- Despliegue automático desde GitHub
- CDN global
- Optimización automática

## Características

- ✅ Catálogo de productos con categorías
- ✅ Carrito de compras
- ✅ Integración con MercadoPago
- ✅ Panel de administración
- ✅ SEO optimizado
- ✅ Responsive design
- ✅ Gestión de inventario
- ✅ Sistema de órdenes
- ✅ Optimización de imágenes

## Licencia

MIT License
