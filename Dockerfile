FROM node:20-alpine

WORKDIR /app

# Instalar dependencias backend
COPY package*.json ./
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Compilar frontend
RUN npm --prefix client install && npm --prefix client run build

EXPOSE 3000 3001 3002 3003 3004 3005

CMD ["node", "services/gateway/server.js"]
