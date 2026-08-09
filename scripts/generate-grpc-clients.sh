#!/bin/bash

# Script to generate TypeScript gRPC-Web clients from proto files
# Uses protoc-gen-grpc-web for browser-compatible gRPC clients

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating TypeScript gRPC-Web clients...${NC}"

# Directories
# The shared package is checked out under either name depending on who cloned
# it. Hardcoding one meant the script failed for anyone with the other, which is
# a poor way to discover your generated clients are stale. PROTO_DIR overrides.
OUT_DIR="app/grpc/generated"
if [ -z "$PROTO_DIR" ]; then
    for candidate in "../homebit-pkg/proto" "../pkg/proto"; do
        if [ -d "$candidate" ]; then
            PROTO_DIR="$candidate"
            break
        fi
    done
fi

if [ -z "$PROTO_DIR" ] || [ ! -d "$PROTO_DIR" ]; then
    echo -e "${RED}Error: proto directory not found. Looked for ../homebit-pkg/proto and ../pkg/proto.${NC}"
    exit 1
fi
echo -e "${GREEN}Using protos from ${PROTO_DIR}${NC}"

# Clean and create output directory
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Check for required tools
if ! command -v protoc &> /dev/null; then
    echo -e "${RED}Error: protoc not found. Install with: brew install protobuf${NC}"
    exit 1
fi

# Check for protoc-gen-grpc-web
if ! command -v protoc-gen-grpc-web &> /dev/null; then
    echo -e "${YELLOW}protoc-gen-grpc-web not found. Installing...${NC}"
    echo -e "${YELLOW}Run: brew install protoc-gen-grpc-web${NC}"
    exit 1
fi

echo -e "${GREEN}Generating TypeScript clients...${NC}"

# Generate JavaScript code with ES6 imports for browser compatibility
protoc \
    --js_out=import_style=commonjs,binary:$OUT_DIR \
    --grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:$OUT_DIR \
    --proto_path=$PROTO_DIR \
    --proto_path=$PROTO_DIR/.. \
    $PROTO_DIR/auth/auth.proto \
    $PROTO_DIR/auth/device.proto \
    $PROTO_DIR/client_profile/client_profile.proto \
    $PROTO_DIR/profile/profile.proto \
    $PROTO_DIR/profile/user_profile.proto \
    $PROTO_DIR/notifications/notifications.proto \
    $PROTO_DIR/notifications/blog.proto \
    $PROTO_DIR/payments/payments.proto \
    $PROTO_DIR/events/events.proto \
    $PROTO_DIR/shared/shared.proto

node scripts/convert-grpc-generated-to-esm.mjs

echo -e "${GREEN}✅ TypeScript gRPC-Web clients generated successfully!${NC}"
echo -e "${GREEN}Output directory: $OUT_DIR${NC}"
echo -e "${YELLOW}Generated files:${NC}"
echo -e "${YELLOW}  - *_pb.js (message types)${NC}"
echo -e "${YELLOW}  - *_grpc_web_pb.js (service clients)${NC}"
echo -e "${YELLOW}  - *ServiceClientPb.ts (TypeScript definitions)${NC}"
