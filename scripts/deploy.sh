#!/bin/bash

# Deploy script para producción
# Uso: ./scripts/deploy.sh [frontend|backend|all]

set -e

FRONTEND_DIR="frontend"
BACKEND_DIR="backend"
TARGET=${1:-all}

echo "🚀 Iniciando despliegue..."

deploy_frontend() {
    echo "📦 Desplegando Frontend a Vercel..."
    cd $FRONTEND_DIR
    
    # Build y test
    npm run build
    npm run lint
    
    # Deploy
    vercel --prod
    
    echo "✅ Frontend desplegado exitosamente"
    cd ..
}

deploy_backend() {
    echo "🔧 Desplegando Backend a Railway..."
    cd $BACKEND_DIR
    
    # Test
    npm run lint || true
    
    # Deploy
    railway deploy
    
    echo "✅ Backend desplegado exitosamente"
    cd ..
}

case $TARGET in
    frontend)
        deploy_frontend
        ;;
    backend)
        deploy_backend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "❌ Uso: ./scripts/deploy.sh [frontend|backend|all]"
        exit 1
        ;;
esac

echo "🎉 Despliegue completado!"
echo "Frontend: https://your-domain.vercel.app"
echo "Backend: https://your-backend.railway.app"
echo "Admin: https://your-backend.railway.app/admin"
