#!/usr/bin/env bash
# ==============================================================================
# Script de Migración Definitiva de Base de Datos al Servidor Local (Ubuntu)
# Proyecto: De los Montes de María
# ==============================================================================
# Este script:
# 1. Instala y configura MySQL Server en este servidor (Ubuntu) si no está presente.
# 2. Configura el servicio para que inicie con el sistema y NUNCA se apague.
# 3. Crea la base de datos 'dbmontesdm' y el usuario 'admin'.
# 4. Importa automáticamente todos los datos y tablas desde 'backup_dbmontesdm.sql'.
# 5. Ajusta el archivo .env para conectarse a 127.0.0.1 (local, sin latencia ni cortes).
# 6. Reinicia la aplicación en PM2.
# ==============================================================================

set -e

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   MIGRACIÓN DE BASE DE DATOS AL SERVIDOR LOCAL (SIEMPRE ACTIVA)${NC}"
echo -e "${CYAN}   De los Montes de María${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Verificar si se ejecuta dentro del directorio correcto
APP_DIR="/home/ubuntu/montesdemaria"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
fi

SQL_FILE="backup_dbmontesdm.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: No se encontró el archivo ${SQL_FILE} en el directorio actual ($(pwd)).${NC}"
    exit 1
fi

# 2. Comprobar e instalar MySQL Server
echo -e "\n${YELLOW}[1/6] Verificando servicio MySQL en el servidor...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}MySQL no está instalado. Procediendo a instalar mysql-server...${NC}"
    sudo apt-get update -y
    sudo apt-get install -y mysql-server
fi

# Asegurar que el servicio MySQL esté iniciado y habilitado para arrancar con el servidor
echo -e "${YELLOW}[2/6] Configurando MySQL como servicio persistente (Always-On)...${NC}"
sudo systemctl enable mysql
sudo systemctl restart mysql

# 3. Configurar base de datos y permisos del usuario admin
echo -e "\n${YELLOW}[3/6] Creando base de datos 'dbmontesdm' y usuario 'admin'...${NC}"
DB_PASS="${DB_PASS:-$(grep '^DB_PASS=' .env 2>/dev/null | cut -d '=' -f2- | tr -d '\"' | tr -d '\'')}"

sudo mysql -e "
CREATE DATABASE IF NOT EXISTS \`dbmontesdm\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear o actualizar usuario admin con acceso local
CREATE USER IF NOT EXISTS 'admin'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`dbmontesdm\`.* TO 'admin'@'localhost' WITH GRANT OPTION;

CREATE USER IF NOT EXISTS 'admin'@'127.0.0.1' IDENTIFIED BY '${DB_PASS}';
ALTER USER 'admin'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`dbmontesdm\`.* TO 'admin'@'127.0.0.1' WITH GRANT OPTION;

FLUSH PRIVILEGES;
"

echo -e "${GREEN}✅ Base de datos 'dbmontesdm' y usuario configurados correctamente.${NC}"

# 4. Importar datos desde el backup
echo -e "\n${YELLOW}[4/6] Importando datos desde ${SQL_FILE}...${NC}"
mysql -u admin -p"${DB_PASS}" -h 127.0.0.1 dbmontesdm < "$SQL_FILE"

# Comprobar tablas restauradas
TABLE_COUNT=$(mysql -u admin -p"${DB_PASS}" -h 127.0.0.1 -N -e "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'dbmontesdm';")
echo -e "${GREEN}✅ Restauración exitosa: ${TABLE_COUNT} tablas cargadas en 'dbmontesdm'.${NC}"

# 5. Actualizar archivo .env del servidor
echo -e "\n${YELLOW}[5/6] Actualizando configuración de variables de entorno (.env)...${NC}"
if [ -f ".env" ]; then
    # Crear respaldo preventivo de .env
    cp .env .env.bak.$(date +%F_%T)

    # Actualizar o reemplazar host, puerto, usuario, password y ssl
    sed -i 's/^DB_HOST=.*/DB_HOST=127.0.0.1/' .env || echo "DB_HOST=127.0.0.1" >> .env
    sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env || echo "DB_PORT=3306" >> .env
    sed -i 's/^DB_USER=.*/DB_USER=admin/' .env || echo "DB_USER=admin" >> .env
    sed -i 's/^DB_NAME=.*/DB_NAME=dbmontesdm/' .env || echo "DB_NAME=dbmontesdm" >> .env
    sed -i 's/^DB_SSL=.*/DB_SSL=false/' .env || echo "DB_SSL=false" >> .env
    echo -e "${GREEN}✅ Archivo .env configurado para conectar localmente a 127.0.0.1 (sin SSL).${NC}"
else
    echo -e "${RED}⚠️ No se encontró archivo .env para actualizar. Recuerda crearlo con DB_HOST=127.0.0.1.${NC}"
fi

# 6. Reiniciar la aplicación con PM2
echo -e "\n${YELLOW}[6/6] Reiniciando la aplicación en PM2...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart montesdemaria || pm2 restart all
    echo -e "${GREEN}✅ Aplicación reiniciada en PM2.${NC}"
else
    echo -e "${YELLOW}PM2 no detectado en PATH, puedes iniciar tu app normalmente.${NC}"
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!${NC}"
echo -e "${GREEN}La base de datos ahora reside en tu propio servidor.${NC}"
echo -e "${GREEN}- Ya no depende de Oracle Cloud ni se apagará por inactividad.${NC}"
echo -e "${GREEN}- Arranca automáticamente con el sistema operativo.${NC}"
echo -e "${GREEN}- Latencia mínima y máxima velocidad de consulta.${NC}"
echo -e "${GREEN}================================================================${NC}"
