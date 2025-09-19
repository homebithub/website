## ---- Build Stage ----
#FROM node:18-alpine AS builder
#WORKDIR /app
#
## Install deps
#COPY package*.json ./
#RUN npm ci
#
## Copy source and build
#COPY . .
#RUN npm run build
#
## ---- Production Stage ----
#FROM node:18-alpine AS production
#WORKDIR /app
#ENV NODE_ENV=production
#
## Copy production files
#COPY --from=builder /app/node_modules ./node_modules
#COPY --from=builder /app/build ./build
#COPY --from=builder /app/public ./public
#COPY --from=builder /app/package*.json ./
#COPY --from=builder /app/server.mjs ./server.mjs
#COPY --from=builder /app/app ./app
#
## Run as non-root
#RUN addgroup -S app && adduser -S -G app app \
#    && chown -R app:app /app
#USER app
#
#EXPOSE 3000
#CMD ["node", "server.mjs"]
# ---- Build Stage ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install all deps (including dev) to build Remix
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime Stage ----
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

# Install curl for healthchecks
RUN apk add --no-cache curl

# Optional: run as non-root user
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -fsS http://localhost:3000/healthz || exit 1
CMD ["node", "server.mjs"]
