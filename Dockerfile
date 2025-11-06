#################################
# Build Stage: Node + ReactRouter
#################################
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps and build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

##########################
# Runtime Stage: Node SSR #
##########################
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app, static assets, and server entry
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.mjs ./server.mjs

# Healthcheck tools
RUN apk add --no-cache curl

# Non-root user
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -fsS http://localhost:3000/healthz || exit 1
CMD ["node", "server.mjs"]
