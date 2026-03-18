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
  
  // google-protobuf CJS modules put exports under .default in Node ESM,
  // so we import into a temp alias and unwrap with .default fallback.
  content = content.replace(
    /var google_protobuf_timestamp_pb = require\('google-protobuf\/google\/protobuf\/timestamp_pb\.js'\)/g,
    "import * as _google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb.js';\nconst google_protobuf_timestamp_pb = _google_protobuf_timestamp_pb.default || _google_protobuf_timestamp_pb"
  );
  
  content = content.replace(
    /var google_protobuf_empty_pb = require\('google-protobuf\/google\/protobuf\/empty_pb\.js'\)/g,
    "import * as _google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb.js';\nconst google_protobuf_empty_pb = _google_protobuf_empty_pb.default || _google_protobuf_empty_pb"
  );
  
  content = content.replace(
    /var google_protobuf_struct_pb = require\('google-protobuf\/google\/protobuf\/struct_pb\.js'\)/g,
    "import * as _google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';\nconst google_protobuf_struct_pb = _google_protobuf_struct_pb.default || _google_protobuf_struct_pb"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.auth = require\('\.\/auth_pb\.js'\);/g,
    "import * as auth_pb from './auth_pb.js';\nconst proto = { auth: auth_pb.default || auth_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.notifications = require\('\.\/notifications_pb\.js'\);/g,
    "import * as notifications_pb from './notifications_pb.js';\nconst proto = { notifications: notifications_pb.default || notifications_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.payments = require\('\.\/payments_pb\.js'\);/g,
    "import * as payments_pb from './payments_pb.js';\nconst proto = { payments: payments_pb.default || payments_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.events = require\('\.\/events_pb\.js'\);/g,
    "import * as events_pb from './events_pb.js';\nconst proto = { events: events_pb.default || events_pb };"
  );
  
  content = content.replace(
    /const proto = \{\};\nproto\.device = require\('\.\/device_pb\.js'\);/g,
    "import * as device_pb from './device_pb.js';\nconst proto = { device: device_pb.default || device_pb };"
  );
  
  // device.proto is in the auth package, so device_grpc_web_pb.js uses proto.auth = require('./device_pb.js')
  content = content.replace(
    /const proto = \{\};\nproto\.auth = require\('\.\/device_pb\.js'\);/g,
    "import * as device_pb from './device_pb.js';\nconst proto = { auth: device_pb.default || device_pb };"
  );
  
  // Replace module.exports with export
  // Dynamically find all *ServiceClient names and export them
  const exportServiceClients = (ns) => {
    const clientNames = [];
    const re = new RegExp(`proto\\.${ns}\\.(\\w+ServiceClient)\\s*=`, 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
      if (!clientNames.includes(m[1])) clientNames.push(m[1]);
    }
    if (clientNames.length > 0) {
      return `export default proto.${ns};\nexport const {\n  ${clientNames.join(',\n  ')},\n} = proto.${ns};`;
    }
    return `export default proto.${ns};`;
  };

  content = content.replace(/module\.exports = proto\.auth;/g, () => exportServiceClients('auth'));
  content = content.replace(/module\.exports = proto\.notifications;/g, () => exportServiceClients('notifications'));
  content = content.replace(/module\.exports = proto\.payments;/g, () => exportServiceClients('payments'));
  content = content.replace(/module\.exports = proto\.events;/g, () => exportServiceClients('events'));
  content = content.replace(/module\.exports = proto\.device;/g, () => exportServiceClients('device'));
  
  // For auth_pb.js files - replace require with import
  content = content.replace(
    /var jspb = require\('google-protobuf'\);/g,
    "import * as jspb from 'google-protobuf';"
  );
  
  // Initialize proto namespace after goog
  content = content.replace(
    /var goog = jspb;\nvar global = globalThis;/g,
    "const goog = jspb;\nvar global = globalThis;\nconst proto = {};"
  );
  
  // Initialize specific proto namespaces based on file content
  if (content.includes('proto.auth.')) {
    content = content.replace(
      /const proto = \{\};/,
      "const proto = {};\nproto.auth = {};"
    );
  }
  if (content.includes('proto.notifications.')) {
    content = content.replace(
      /const proto = \{\};/,
      "const proto = {};\nproto.notifications = {};"
    );
  }
  if (content.includes('proto.payments.')) {
    content = content.replace(
      /const proto = \{\};/,
      "const proto = {};\nproto.payments = {};"
    );
  }
  if (content.includes('proto.events.')) {
    content = content.replace(
      /const proto = \{\};/,
      "const proto = {};\nproto.events = {};"
    );
  }
  if (content.includes('proto.device.')) {
    content = content.replace(
      /const proto = \{\};/,
      "const proto = {};\nproto.device = {};"
    );
  }
  
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
