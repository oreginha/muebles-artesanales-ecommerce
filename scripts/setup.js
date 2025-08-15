const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Configurando proyecto inicial...');

// Función para generar secretos aleatorios
function generateSecret(length = 32) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generar múltiples app keys para Strapi
function generateAppKeys() {
  return Array.from({ length: 4 }, () => generateSecret()).join(',');
}

// Crear archivos .env desde templates
function createEnvFiles() {
  console.log('📝 Creando archivos de variables de entorno...');

  // Frontend environment
  const frontendEnv = `# Frontend Environment Variables
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337/api
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# MercadoPago (TEST keys - cambiar por PROD en producción)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-your_public_key_here
MERCADOPAGO_ACCESS_TOKEN=TEST-your_access_token_here

# Cloudinary (opcional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Analytics (opcional)
NEXT_PUBLIC_GA_ID=your_ga_id
`;

  // Backend environment con secretos generados
  const backendEnv = `# Backend Environment Variables
HOST=0.0.0.0
PORT=1337
APP_KEYS=${generateAppKeys()}
API_TOKEN_SALT=${generateSecret()}
ADMIN_JWT_SECRET=${generateSecret()}
TRANSFER_TOKEN_SALT=${generateSecret()}
JWT_SECRET=${generateSecret()}

# Database (PostgreSQL)
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=muebles_artesanales
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_SSL=false

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-your_access_token_here
MERCADOPAGO_WEBHOOK_SECRET=${generateSecret()}

# CORS
CLIENT_URL=http://localhost:3000
`;

  // Escribir archivos
  fs.writeFileSync(path.join(__dirname, '..', 'frontend', '.env.local'), frontendEnv);
  fs.writeFileSync(path.join(__dirname, '..', 'backend', '.env'), backendEnv);

  console.log('✅ Archivos .env creados');
}

// Verificar dependencias del sistema
function checkDependencies() {
  console.log('🔍 Verificando dependencias del sistema...');

  const dependencies = [
    { name: 'Node.js', command: 'node --version', minVersion: 'v18' },
    { name: 'npm', command: 'npm --version', minVersion: '8' },
    { name: 'Git', command: 'git --version', minVersion: '2' }
  ];

  dependencies.forEach(dep => {
    try {
      const version = execSync(dep.command, { encoding: 'utf8' }).trim();
      console.log(`  ✅ ${dep.name}: ${version}`);
    } catch (error) {
      console.log(`  ❌ ${dep.name}: No instalado`);
    }
  });
}

// Verificar PostgreSQL
function checkPostgreSQL() {
  console.log('🐘 Verificando PostgreSQL...');
  
  try {
    execSync('psql --version', { encoding: 'utf8' });
    console.log('  ✅ PostgreSQL encontrado');
    
    // Intentar conectar
    try {
      execSync('psql -U postgres -c "SELECT version();"', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('  ✅ Conexión a PostgreSQL exitosa');
    } catch (error) {
      console.log('  ⚠️  PostgreSQL instalado pero no se puede conectar');
      console.log('     Asegúrate de que el servicio esté corriendo');
    }
  } catch (error) {
    console.log('  ❌ PostgreSQL no encontrado');
    console.log('     Instalar desde: https://www.postgresql.org/download/');
  }
}

// Instalar dependencias
function installDependencies() {
  console.log('📦 Instalando dependencias...');
  
  try {
    // Root dependencies
    console.log('  📦 Instalando dependencias root...');
    execSync('npm install', { cwd: __dirname + '/..', stdio: 'inherit' });
    
    // Frontend dependencies
    if (fs.existsSync(path.join(__dirname, '..', 'frontend'))) {
      console.log('  🎨 Instalando dependencias del frontend...');
      execSync('npm install', { 
        cwd: path.join(__dirname, '..', 'frontend'), 
        stdio: 'inherit' 
      });
    }
    
    // Backend dependencies
    if (fs.existsSync(path.join(__dirname, '..', 'backend'))) {
      console.log('  🔧 Instalando dependencias del backend...');
      execSync('npm install', { 
        cwd: path.join(__dirname, '..', 'backend'), 
        stdio: 'inherit' 
      });
    }
    
    console.log('✅ Todas las dependencias instaladas');
  } catch (error) {
    console.error('❌ Error instalando dependencias:', error.message);
  }
}

// Crear directorios necesarios
function createDirectories() {
  console.log('📁 Creando directorios necesarios...');
  
  const directories = [
    'logs',
    'backups',
    'temp',
    'frontend/public/uploads',
    'backend/public/uploads'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`  ✅ Creado: ${dir}`);
    }
  });
}

// Configurar Git hooks
function setupGitHooks() {
  console.log('🪝 Configurando Git hooks...');
  
  const preCommitHook = `#!/bin/sh
# Pre-commit hook
echo "Ejecutando pre-commit checks..."

# Lint frontend
cd frontend && npm run lint --silent
if [ $? -ne 0 ]; then
  echo "❌ Frontend lint failed"
  exit 1
fi

# Lint backend (si existe)
if [ -d "backend" ]; then
  cd ../backend && npm run lint --silent 2>/dev/null || true
fi

echo "✅ Pre-commit checks passed"
`;

  const hooksDir = path.join(__dirname, '..', '.git', 'hooks');
  if (fs.existsSync(hooksDir)) {
    fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
    
    // Hacer ejecutable en sistemas Unix
    try {
      execSync('chmod +x .git/hooks/pre-commit', { cwd: path.join(__dirname, '..') });
      console.log('  ✅ Git hooks configurados');
    } catch (error) {
      console.log('  ⚠️  No se pudo hacer ejecutable el hook (normal en Windows)');
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 Setup del proyecto Muebles Artesanales E-commerce\n');
  
  // Verificaciones
  checkDependencies();
  checkPostgreSQL();
  
  // Configuración
  createDirectories();
  createEnvFiles();
  setupGitHooks();
  
  console.log('\n🎉 Setup completado!');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Configurar las variables de entorno en los archivos .env');
  console.log('2. Crear la base de datos PostgreSQL:');
  console.log('   psql -U postgres -c "CREATE DATABASE muebles_artesanales;"');
  console.log('3. Instalar dependencias: npm run install:all');
  console.log('4. Iniciar desarrollo: npm run dev');
  console.log('\n📖 Consultar docs/ para más información');
}

// Ejecutar
main().catch(console.error);
