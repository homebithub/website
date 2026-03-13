#!/bin/bash

# Script to generate TypeScript clients using ts-proto
# This generates proper ES modules that work in browsers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating TypeScript clients with ts-proto...${NC}"

# Directories
PROTO_DIR="../homebit-pkg/proto"
OUT_DIR="app/grpc/generated"

# Check if proto directory exists
if [ ! -d "$PROTO_DIR" ]; then
    echo -e "${RED}Error: Proto directory not found at $PROTO_DIR${NC}"
    exit 1
fi

# Clean and create output directory
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Check for required tools
if ! command -v protoc &> /dev/null; then
    echo -e "${RED}Error: protoc not found. Install with: brew install protobuf${NC}"
    exit 1
fi

echo -e "${GREEN}Generating TypeScript clients with ts-proto...${NC}"

# Generate TypeScript code with ts-proto for nice-grpc-web
protoc \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_out=$OUT_DIR \
    --ts_proto_opt=outputServices=nice-grpc,outputServices=generic-definitions,useExactTypes=false \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=env=browser \
    --ts_proto_opt=useOptionals=messages \
    --proto_path=$PROTO_DIR \
    --proto_path=$PROTO_DIR/.. \
    $PROTO_DIR/auth/auth.proto \
    $PROTO_DIR/auth/device.proto \
    $PROTO_DIR/notifications/notifications.proto \
    $PROTO_DIR/payments/payments.proto \
    $PROTO_DIR/events/events.proto

echo -e "${GREEN}✅ TypeScript clients generated successfully!${NC}"
echo -e "${GREEN}Output directory: $OUT_DIR${NC}"
echo -e "${YELLOW}Generated files:${NC}"
echo -e "${YELLOW}  - *.ts (TypeScript message types and services)${NC}"
