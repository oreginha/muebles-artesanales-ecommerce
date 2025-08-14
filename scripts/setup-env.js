const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando variables de entorno...');

// Frontend environment template
const frontendEnvTemplate = `# Frontend Environment Variables
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_public_key_here
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here

# Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=your_ga_id
`;

// Backend environment template
const backendEnvTemplate = `# Backend Environment Variables
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys_here
API_TOKEN_SALT=your_api_token_salt_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here
TRANSFER_TOKEN_SALT=your_transfer_token_salt_here
JWT_SECRET=your_jwt_secret_here

# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=muebles_artesanales
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_SSL=false

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=your_access_token_here
MERCADOPAGO_WEBHOOK_SECRET=your_webhook_secret_here
`;

// Create frontend .env.example
const frontendEnvPath = path.join(__dirname, '..', 'frontend', '.env.example');
fs.writeFileSync(frontendEnvPath, frontendEnvTemplate);
console.log('✅ Frontend .env.example creado');

// Create backend .env.example
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env.example');
fs.writeFileSync(backendEnvPath, backendEnvTemplate);
console.log('✅ Backend .env.example creado');

console.log(`
🎉 Configuración completada!

Próximos pasos:
1. Configura tus variables de entorno copiando los archivos .env.example
2. Instala las dependencias: npm run install:all
3. Configura la base de datos PostgreSQL
4. Ejecuta el proyecto: npm run dev

Para más información, revisa la documentación en docs/
`);
