#!/bin/bash
set -e
cd /home/ubuntu/montesdemaria
echo "[1/4] Descargando ultimos cambios de GitHub..."
git fetch origin main
git reset --hard origin/main

echo "[2/4] Instalando dependencias..."
npm install --production=false

echo "[3/4] Compilando frontend..."
npm run build

echo "[4/4] Iniciando ecosistema de microservicios con PM2..."
pm2 delete montesdemaria 2>/dev/null || true
pm2 startOrReload ecosystem.config.js
pm2 save

echo "=== DESPLIEGUE DE MICROSERVICIOS COMPLETADO CON EXITO ==="
