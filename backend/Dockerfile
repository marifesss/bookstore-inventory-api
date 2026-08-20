FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

# El cliente de Prisma se genera a partir del schema, por eso se copia
# antes que el resto del codigo: cambiar un caso de uso no invalida esta capa.
COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

# `migrate deploy` aplica las migraciones existentes sin pedir confirmacion
# ni regenerar nada: es el comando pensado para arranque automatico.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
