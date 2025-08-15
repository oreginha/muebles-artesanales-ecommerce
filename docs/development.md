# Guía de Desarrollo - Muebles Artesanales E-commerce

## Configuración del Entorno Local

### Prerequisitos
- Node.js 18+ (recomendado: usar nvm)
- PostgreSQL 14+
- Git
- VS Code (recomendado)

### Instalación Paso a Paso

#### 1. Clonar y configurar el proyecto
```bash
git clone https://github.com/oreginha/muebles-artesanales-ecommerce.git
cd muebles-artesanales-ecommerce
npm install
npm run setup
```

#### 2. Configurar PostgreSQL
```bash
# Instalar PostgreSQL (Windows)
# Descargar desde: https://www.postgresql.org/download/windows/

# Crear base de datos
psql -U postgres
CREATE DATABASE muebles_artesanales;
CREATE USER strapi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE muebles_artesanales TO strapi_user;
\q
```

#### 3. Configurar variables de entorno

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-your-public-key
MERCADOPAGO_ACCESS_TOKEN=TEST-your-access-token
```

**Backend (.env)**
```bash
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=muebles_artesanales
DATABASE_USERNAME=strapi_user
DATABASE_PASSWORD=your_password
DATABASE_SSL=false
```

### Comandos de Desarrollo

```bash
# Instalar todas las dependencias
npm run install:all

# Ejecutar ambos servicios
npm run dev

# Solo frontend
npm run dev:frontend

# Solo backend
npm run dev:backend

# Construir para producción
npm run build

# Linting y formateo
npm run lint
npm run format
```

### Estructura de Desarrollo

#### Workflow de Git
```bash
# Crear nueva feature
git checkout -b feature/nueva-funcionalidad
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Merge después de review
```

#### Convenciones de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formateo, sin cambios de código
- `refactor:` Refactoring de código
- `test:` Agregar o corregir tests
- `chore:` Mantenimiento

### Debugging

#### Frontend (Next.js)
```bash
# Modo debug
npm run dev -- --inspect

# Ver en DevTools: chrome://inspect
```

#### Backend (Strapi)
```bash
# Logs detallados
DEBUG=strapi:* npm run develop
```

### Testing

#### Setup de Testing
```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

#### Ejecutar Tests
```bash
# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Troubleshooting

### Problemas Comunes

#### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
pg_ctl status

# Verificar conexión
psql -h localhost -U strapi_user -d muebles_artesanales
```

#### Error de puertos ocupados
```bash
# Matar proceso en puerto 3000
npx kill-port 3000

# Matar proceso en puerto 1337
npx kill-port 1337
```

#### Problemas con dependencias
```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Logs y Monitoreo

#### Ver logs en desarrollo
```bash
# Frontend (Next.js)
tail -f .next/trace.log

# Backend (Strapi)
tail -f backend/.tmp/data.db.log
```

#### Performance profiling
```bash
# Analizar bundle size
npm run analyze

# Lighthouse en local
npx lighthouse http://localhost:3000 --view
```
