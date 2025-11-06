##########################
# 1) Build client assets #
##########################
FROM node:22-alpine AS web-builder
WORKDIR /app

# Install dependencies and build React Router app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

##########################
# 2) Build Go web server  #
##########################
FROM golang:1.24-alpine AS go-builder
WORKDIR /src
ENV CGO_ENABLED=0 GOOS=linux

# Only stdlib used
COPY go.mod ./
COPY main.go ./
RUN go build -o /out/server ./main.go

##########################
# 3) Runtime              #
##########################
FROM alpine:3
WORKDIR /app

# Tools for healthcheck
RUN apk add --no-cache ca-certificates curl && update-ca-certificates

# Copy built client and public assets
COPY --from=web-builder /app/build ./build
COPY --from=web-builder /app/public ./public

# Copy Go server binary
COPY --from=go-builder /out/server ./server

# Optional: non-root user
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -fsS http://localhost:3000/healthz || exit 1
CMD ["/app/server"]
