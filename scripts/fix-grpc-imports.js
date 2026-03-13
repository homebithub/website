#!/usr/bin/env node

/**
 * Post-process generated gRPC-Web files to convert CommonJS to ES modules
 * This fixes the "require is not defined" error in browsers
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DIR = path.join(__dirname, '../app/grpc/generated');

function convertCommonJSToESM(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace require() calls with import statements
  content = content.replace(
    /const grpc = \{\};\ngrpc\.web = require\('grpc-web'\);/g,
    "import * as grpcWeb from 'grpc-web';\nconst grpc = { web: grpcWeb };"
  );
  
  content = content.replace(
    /var google_protobuf_timestamp_pb = require\('google-protobuf\/google\/protobuf\/timestamp_pb\.js'\)/g,
    "import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb.js'"
  );
  
  content = content.replace(
    /var google_protobuf_empty_pb = require\('google-protobuf\/google\/protobuf\/empty_pb\.js'\)/g,
    "import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb.js'"
  );
  
  content = content.replace(
    /var google_protobuf_struct_pb = require\('google-protobuf\/google\/protobuf\/struct_pb\.js'\)/g,
    "import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb.js'"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.auth = require\('\.\/auth_pb\.js'\);/g,
    "import './auth_pb.js';\nconst proto = globalThis.__proto_auth || {};\nif (!proto.auth) proto.auth = {};"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.notifications = require\('\.\/notifications_pb\.js'\);/g,
    "import * as notifications_pb from './notifications_pb.js';\nconst proto = { notifications: notifications_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.payments = require\('\.\/payments_pb\.js'\);/g,
    "import * as payments_pb from './payments_pb.js';\nconst proto = { payments: payments_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.events = require\('\.\/events_pb\.js'\);/g,
    "import * as events_pb from './events_pb.js';\nconst proto = { events: events_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.device = require\('\.\/device_pb\.js'\);/g,
    "import * as device_pb from './device_pb.js';\nconst proto = { device: device_pb };"
  );
  
  // Replace module.exports with export
  // Note: proto.auth.AuthServiceClient (capital A) is the actual class name
  content = content.replace(
    /module\.exports = proto\.auth;/g,
    'export default proto.auth;\nexport const { AuthServiceClient, AuthServicePromiseClient } = proto.auth;'
  );
  
  content = content.replace(
    /module\.exports = proto\.notifications;/g,
    'export default proto.notifications;\nexport const { NotificationsServiceClient, NotificationsServicePromiseClient } = proto.notifications;'
  );
  
  content = content.replace(
    /module\.exports = proto\.payments;/g,
    'export default proto.payments;\nexport const { PaymentsServiceClient, PaymentsServicePromiseClient } = proto.payments;'
  );
  
  content = content.replace(
    /module\.exports = proto\.events;/g,
    'export default proto.events;\nexport const { EventsServiceClient, EventsServicePromiseClient } = proto.events;'
  );
  
  content = content.replace(
    /module\.exports = proto\.device;/g,
    'export default proto.device;\nexport const { DeviceServiceClient, DeviceServicePromiseClient } = proto.device;'
  );
  
  // For auth_pb.js files - replace require with import
  content = content.replace(
    /var jspb = require\('google-protobuf'\);/g,
    "import * as jspb from 'google-protobuf';"
  );
  
  content = content.replace(
    /var goog = jspb;/g,
    "const goog = jspb;"
  );
  
  // Replace module.exports for pb files
  content = content.replace(
    /module\.exports = proto;/g,
    'export default proto;'
  );
  
  // Replace goog.object.extend(exports, proto.X) with export
  content = content.replace(
    /goog\.object\.extend\(exports, proto\.auth\);/g,
    'export default proto.auth;'
  );
  
  content = content.replace(
    /goog\.object\.extend\(exports, proto\.notifications\);/g,
    'export default proto.notifications;'
  );
  
  content = content.replace(
    /goog\.object\.extend\(exports, proto\.payments\);/g,
    'export default proto.payments;'
  );
  
  content = content.replace(
    /goog\.object\.extend\(exports, proto\.events\);/g,
    'export default proto.events;'
  );
  
  content = content.replace(
    /goog\.object\.extend\(exports, proto\.device\);/g,
    'export default proto.device;'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Converted: ${path.basename(filePath)}`);
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      convertCommonJSToESM(fullPath);
    }
  }
}

console.log('🔧 Converting CommonJS to ES modules...');
processDirectory(GENERATED_DIR);
console.log('✅ All files converted!');
