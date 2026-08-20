# --- Build ---
FROM node:22-alpine AS build
WORKDIR /app

# Vite sustituye las variables VITE_* en tiempo de build, no de arranque:
# por eso llega como ARG y no como variable de entorno del contenedor final.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime ---
# La SPA es HTML/JS estatico: nginx la sirve sin arrastrar Node a produccion.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
