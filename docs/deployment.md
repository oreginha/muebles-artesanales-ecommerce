# Guía de Despliegue - Muebles Artesanales E-commerce

## Arquitectura de Despliegue

```
Frontend (Vercel) ←→ Backend (Railway) ←→ PostgreSQL (Railway)
                           ↓
                    MercadoPago API
                           ↓
                    Cloudinary API
```

## Despliegue Frontend (Vercel)

### 1. Configuración Inicial

#### Conectar con GitHub
1. Ir a [vercel.com](https://vercel.com)
2. Sign up/Login con GitHub
3. Import Git Repository
4. Seleccionar `muebles-artesanales-ecommerce`
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Variables de Entorno en Vercel
```bash
NEXT_PUBLIC_STRAPI_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_STRAPI_URL=https://your-backend.railway.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=PROD-your-public-key
MERCADOPAGO_ACCESS_TOKEN=APP_USR-your-access-token
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 2. Configuración de Dominio

#### Dominio personalizado
1. En Vercel Dashboard → Settings → Domains
2. Agregar dominio: `muebles-artesanales.com`
3. Configurar DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

#### SSL/TLS
- Vercel maneja SSL automáticamente
- Verificar en: Settings → Security

## Despliegue Backend (Railway)

### 1. Configuración del Proyecto

#### Crear proyecto en Railway
1. Ir a [railway.app](https://railway.app)
2. Login con GitHub
3. New Project → Deploy from GitHub repo
4. Seleccionar `muebles-artesanales-ecommerce`
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

#### Agregar PostgreSQL
1. En Railway project → Add service → Database → PostgreSQL
2. Railway creará automáticamente:
   - Database URL
   - Credenciales
   - Variables de entorno

### 2. Variables de Entorno en Railway

```bash
# App Configuration
HOST=0.0.0.0
PORT=$PORT
NODE_ENV=production

# Secrets (generar con: openssl rand -base64 32)
APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database (Railway provee automáticamente)
DATABASE_URL=$DATABASE_URL

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-your-production-token
MERCADOPAGO_WEBHOOK_SECRET=your-webhook-secret

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret

# CORS
CLIENT_URL=https://your-domain.vercel.app
```

### 3. Configuración de Base de Datos

#### Migraciones automáticas
Railway ejecutará automáticamente:
```bash
npm run build
npm start
```

Strapi creará las tablas automáticamente en el primer deploy.

## Configuración de MercadoPago

### 1. Cuenta de Producción

#### Configurar aplicación
1. Ir a [developers.mercadopago.com](https://developers.mercadopago.com)
2. Mis aplicaciones → Crear aplicación
3. Configurar:
   - **Nombre**: Muebles Artesanales
   - **Sector**: Retail
   - **Modelo de integración**: Online payments

#### Obtener credenciales de producción
- **Public Key**: `APP_USR-xxxxxxxx-xxxxxxxx`
- **Access Token**: `APP_USR-xxxxxxxx-xxxxxxxx`

### 2. Configurar Webhooks

#### URL de webhook
```
https://your-backend.railway.app/api/webhooks/mercadopago
```

#### Eventos a suscribir
- `payment`
- `plan`
- `subscription`
- `invoice`

## Configuración DNS

### Registrar dominio
Opciones recomendadas:
- **Namecheap** (económico)
- **GoDaddy** (popular)
- **Google Domains** (confiable)

### Configuración DNS
```bash
# Para Vercel
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# Para Railway API (subdominio)
Type: CNAME
Name: api
Value: your-project.railway.app
```

## SSL/TLS y Seguridad

### Vercel (automático)
- SSL/TLS automático con Let's Encrypt
- HTTP/2 habilitado
- Brotli compression

### Railway (automático)
- SSL/TLS automático
- HTTPS redirect automático

### Seguridad Headers
Configurado en `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
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

## Monitoreo y Analytics

### Vercel Analytics
```bash
# Habilitar en Vercel Dashboard
Analytics → Enable

# Instalar en Next.js
npm install @vercel/analytics
```

### Railway Metrics
- CPU usage
- Memory usage
- Response time
- Request count

### Uptime Monitoring
Opciones recomendadas:
- **UptimeRobot** (gratuito)
- **Pingdom** (avanzado)
- **StatusPage** (página de estado)

## Backup y Recuperación

### Base de Datos
```bash
# Backup automático (Railway)
# Railway hace backups automáticos diarios

# Backup manual
pg_dump $DATABASE_URL > backup.sql

# Restaurar
psql $DATABASE_URL < backup.sql
```

### Archivos y Media
```bash
# Cloudinary tiene backups automáticos
# También configurar backup local:

# Script de backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups/$DATE
pg_dump $DATABASE_URL > backups/$DATE/database.sql
echo "Backup completed: $DATE"
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway login --token ${{ secrets.RAILWAY_TOKEN }}
          railway deploy --service backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## Troubleshooting

### Problemas Comunes

#### Error 500 en producción
```bash
# Verificar logs en Railway
railway logs --service backend

# Verificar variables de entorno
railway variables --service backend
```

#### Error de CORS
```javascript
// backend/config/middlewares.js
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: [
        'http://localhost:3000',
        'https://your-domain.vercel.app',
        'https://your-domain.com'
      ]
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

#### Problemas con MercadoPago
```bash
# Verificar webhook
curl -X POST https://your-backend.railway.app/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verificar credenciales
curl -H "Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN" \
  https://api.mercadopago.com/v1/account/me
```

## Performance Optimization

### Frontend
- **Image optimization**: Next.js automático
- **Code splitting**: Lazy loading de componentes
- **CDN**: Vercel Edge Network
- **Compression**: Gzip/Brotli automático

### Backend
- **Database indexing**: PostgreSQL automático
- **Caching**: Redis (Railway addon)
- **Rate limiting**: Configurado en Strapi

## Seguridad en Producción

### Checklist de Seguridad
- [ ] HTTPS habilitado
- [ ] Variables secretas en .env
- [ ] CORS configurado correctamente
- [ ] Rate limiting activado
- [ ] Headers de seguridad configurados
- [ ] Webhook signatures verificadas
- [ ] Admin panel protegido
- [ ] Database backups configurados

### Monitoreo de Seguridad
```bash
# Verificar certificados SSL
openssl s_client -connect your-domain.com:443

# Verificar headers de seguridad
curl -I https://your-domain.com

# Test de vulnerabilidades
npm audit
```

## Mantenimiento

### Actualizaciones
```bash
# Actualizar dependencias (mensual)
npm update
npm audit fix

# Actualizar Strapi (seguir migration guides)
npx @strapi/upgrade major

# Actualizar Next.js
npx @next/codemod@latest
```

### Logs y Debugging
```bash
# Railway logs en tiempo real
railway logs --follow --service backend

# Vercel logs
vercel logs https://your-domain.vercel.app

# Logs específicos de errores
railway logs --filter "ERROR" --service backend
```

### Alertas automáticas
Configurar en Railway:
- **CPU > 80%**
- **Memory > 90%**
- **Response time > 5s**
- **Error rate > 5%**

## Rollback Strategy

### Frontend (Vercel)
```bash
# Ver deployments
vercel ls

# Rollback a deployment anterior
vercel rollback <deployment-url>
```

### Backend (Railway)
```bash
# Ver deployments
railway status

# Rollback usando Git
git revert <commit-hash>
git push origin main
```

### Database
```bash
# Restaurar desde backup
railway db restore <backup-id>

# O desde archivo local
psql $DATABASE_URL < backup-YYYYMMDD.sql
```
