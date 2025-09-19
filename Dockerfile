# ---- Build Stage ----
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production Stage (custom server) ----
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Copy production files and node_modules (builder installed all deps)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/app ./app

RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app
USER app

EXPOSE 3000
CMD ["node", "server.mjs"]
