#################################
# Build Stage: React Router SSR #
#################################
FROM node:22-alpine AS builder
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build the app
COPY . .
RUN npm run build

##########################
# Runtime Stage: Node SSR #
##########################
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app, public assets, and server
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.mjs ./server.mjs

# Add Fastify dependencies
RUN npm install fastify @fastify/cors @fastify/static

# Add curl for healthcheck
RUN apk add --no-cache curl

# Run as non-root user
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app
USER app

EXPOSE 3000

# Healthcheck for K8s
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:3000/healthz || exit 1

CMD ["node", "server.mjs"]
