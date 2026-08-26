# Etapa 1: Dependencias
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Etapa 2: Compilador (Builder)
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Next.js recoge variables de entorno durante el build, si las hay.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Etapa 3: Producción (Runner)
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Si vas a usar telemetría, puedes deshabilitarla
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar configuración y archivos públicos
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
# Copiar el build standalone generado
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
# El archivo server.js es generado por la salida 'standalone'
CMD ["node", "server.js"]
