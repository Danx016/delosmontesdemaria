#!/usr/bin/env bash
# ==============================================================================
# Script de Configuración y Desbloqueo de Puertos de Correo para el Servidor
# Plataforma: De los Montes de María
# ==============================================================================

set -e

# Colores para salida de consola
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   CONFIGURACIÓN AUTOMÁTICA DE CORREO Y APERTURA DE PUERTOS     ${NC}"
echo -e "${CYAN}   De los Montes de María                                       ${NC}"
echo -e "${CYAN}================================================================${NC}"

# 1. Navegar al directorio del proyecto si existe
APP_DIR="/home/ubuntu/montesdemaria"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
fi

# 2. Configurar el Firewall UFW para permitir el tráfico de salida de correo
echo -e "\n${YELLOW}[1/4] Abriendo puertos de salida de correo en el Firewall (UFW)...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw default allow outgoing || true
    sudo ufw allow out 465/tcp comment 'SMTP SSL' || true
    sudo ufw allow out 587/tcp comment 'SMTP STARTTLS' || true
    sudo ufw allow out 443/tcp comment 'HTTPS API' || true
    sudo ufw allow out 2525/tcp comment 'SMTP ALT' || true
    sudo ufw allow out 53/udp comment 'DNS UDP' || true
    sudo ufw allow out 53/tcp comment 'DNS TCP' || true
    sudo ufw reload || true
    echo -e "${GREEN}✅ Puertos 465, 587, 443 y 2525 habilitados en UFW.${NC}"
else
    echo -e "${YELLOW}ℹ️ UFW no está activo o instalado, continuando con iptables...${NC}"
fi

# 3. Asegurar reglas en iptables (Oracle Cloud / Ubuntu)
echo -e "\n${YELLOW}[2/4] Verificando reglas de salida en iptables...${NC}"
if command -v iptables &> /dev/null; then
    sudo iptables -A OUTPUT -p tcp --dport 465 -j ACCEPT 2>/dev/null || true
    sudo iptables -A OUTPUT -p tcp --dport 587 -j ACCEPT 2>/dev/null || true
    sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
    sudo iptables -A OUTPUT -p tcp --dport 2525 -j ACCEPT 2>/dev/null || true
    echo -e "${GREEN}✅ Reglas de iptables añadidas.${NC}"
fi

# 4. Probar conectividad hacia Gmail SMTP
echo -e "\n${YELLOW}[3/4] Probando conectividad hacia smtp.gmail.com...${NC}"
if command -v nc &> /dev/null; then
    if nc -z -w 5 smtp.gmail.com 465 2>/dev/null; then
        echo -e "${GREEN}✅ Puerto 465 (SSL): Conexión directa a Google SMTP EXITOSA.${NC}"
    else
        echo -e "${RED}⚠️ Puerto 465 (SSL): No responde. Verificando puerto 587...${NC}"
    fi

    if nc -z -w 5 smtp.gmail.com 587 2>/dev/null; then
        echo -e "${GREEN}✅ Puerto 587 (STARTTLS): Conexión directa a Google SMTP EXITOSA.${NC}"
    else
        echo -e "${RED}⚠️ Puerto 587 (STARTTLS): No responde.${NC}"
    fi
fi

# 5. Ejecutar prueba de envío real con Node.js
echo -e "\n${YELLOW}[4/4] Enviando correo de bienvenida de prueba en vivo...${NC}"
if [ -f "scripts/probar_envio_correo.js" ]; then
    node scripts/probar_envio_correo.js || true
fi

# 6. Reiniciar PM2 para aplicar cambios en caliente
if command -v pm2 &> /dev/null; then
    echo -e "\n${YELLOW}Reiniciando la aplicación en PM2...${NC}"
    pm2 restart montesdemaria || pm2 restart all || true
    echo -e "${GREEN}✅ Aplicación recargada con PM2.${NC}"
fi

echo -e "\n${GREEN}================================================================${NC}"
echo -e "${GREEN}🎉 PROCESO COMPLETADO.${NC}"
echo -e "${GREEN}================================================================${NC}"
