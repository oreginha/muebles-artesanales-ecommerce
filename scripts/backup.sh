#!/bin/bash

# Script de backup para base de datos y archivos
# Uso: ./scripts/backup.sh

set -e

# Configuración
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

echo "🔄 Iniciando backup..."

# Crear directorio de backup
mkdir -p $BACKUP_PATH

# Backup de base de datos
if [ -n "$DATABASE_URL" ]; then
    echo "📊 Haciendo backup de la base de datos..."
    pg_dump $DATABASE_URL > $BACKUP_PATH/database.sql
    echo "✅ Backup de base de datos completado"
else
    echo "⚠️  DATABASE_URL no configurada, saltando backup de BD"
fi

# Backup de archivos de configuración
echo "📁 Haciendo backup de archivos de configuración..."
cp package.json $BACKUP_PATH/
cp README.md $BACKUP_PATH/
cp -r docs $BACKUP_PATH/

# Comprimir backup
echo "🗜️  Comprimiendo backup..."
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Limpiar carpeta temporal
rm -rf $BACKUP_PATH

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup completado: $BACKUP_DIR/backup_$DATE.tar.gz"
echo "📏 Tamaño: $(du -h $BACKUP_DIR/backup_$DATE.tar.gz | cut -f1)"
