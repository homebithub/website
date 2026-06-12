import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const generatedDir = path.resolve('app/grpc/generated');

const requireLinePattern = /^(var|const)\s+([A-Za-z0-9_]+)\s*=\s*require\('([^']+)'\);?$/;

function toImport(name, source, needsSemicolon = true) {
  const importName = `_${name}`;
  const suffix = needsSemicolon ? ';' : '';
  return [
    `import * as ${importName} from '${source}';`,
    `const ${name} = ${importName}.default || ${importName}${suffix}`,
  ];
}

function getPackageName(source) {
  const patterns = [
    /goog\.object\.extend\(exports,\s*proto\.([A-Za-z0-9_]+)\)/,
    /module\.exports\s*=\s*proto\.([A-Za-z0-9_]+)/,
    /proto\.([A-Za-z0-9_]+)\.[A-Za-z0-9_]+\s*=/,
    /goog\.exportSymbol\('proto\.([A-Za-z0-9_]+)\./,
  ];

  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return match[1];
  }

  throw new Error('Could not determine protobuf package name');
}

function convertMessageFile(source) {
  const packageName = getPackageName(source);
  const lines = source.split('\n');
  const output = [];
  let hasDefaultExport = source.includes(`export default proto.${packageName};`);
  let hasProtoObject = false;
  let hasPackageObject = false;

  for (const line of lines) {
    if (line === "var jspb = require('google-protobuf');") {
      output.push("import * as jspb from 'google-protobuf';", 'const goog = jspb;');
      continue;
    }

    if (line === 'var goog = jspb;') {
      continue;
    }

    if (line === 'var global = globalThis;') {
      output.push('var global = globalThis;');
      if (!hasProtoObject) {
        output.push('const proto = {};');
        hasProtoObject = true;
      }
      if (!hasPackageObject) {
        output.push(`proto.${packageName} = {};`);
        hasPackageObject = true;
      }
      continue;
    }

    if (line === 'const proto = {};') {
      if (!hasProtoObject) {
        output.push(line);
        hasProtoObject = true;
      }
      continue;
    }

    if (line === `proto.${packageName} = {};`) {
      if (!hasPackageObject) {
        output.push(line);
        hasPackageObject = true;
      }
      continue;
    }

    const requireMatch = line.match(requireLinePattern);
    if (requireMatch) {
      const [, , name, sourcePath] = requireMatch;
      output.push(...toImport(name, sourcePath));
      continue;
    }

    if (line.includes(`goog.object.extend(exports, proto.${packageName});`)) {
      continue;
    }

    if (line.includes(`module.exports = proto.${packageName};`)) {
      output.push(`export default proto.${packageName};`);
      hasDefaultExport = true;
      continue;
    }

    output.push(line);
  }

  if (!hasDefaultExport) {
    output.push(`export default proto.${packageName};`);
  }

  return output.join('\n');
}

function convertGrpcFile(source) {
  const packageName = getPackageName(source);
  const clientNames = Array.from(source.matchAll(new RegExp(`proto\\.${packageName}\\.([A-Za-z0-9_]+(?:Promise)?Client)\\s*=`, 'g')))
    .map((match) => match[1]);
  const uniqueClientNames = [...new Set(clientNames)];
  const lines = source.split('\n');
  const output = [];
  let skippingGrpcRequire = false;
  let skippingEmptyProto = false;

  for (const line of lines) {
    if (line === 'const grpc = {};') {
      output.push("import * as grpcWeb from 'grpc-web';", 'const grpc = { web: grpcWeb };');
      skippingGrpcRequire = true;
      continue;
    }

    if (skippingGrpcRequire) {
      if (line === "grpc.web = require('grpc-web');") {
        skippingGrpcRequire = false;
        continue;
      }
      skippingGrpcRequire = false;
    }

    if (line === 'const proto = {};') {
      skippingEmptyProto = true;
      continue;
    }

    const protoRequireMatch = line.match(new RegExp(`^proto\\.${packageName}\\s*=\\s*require\\('([^']+)'\\);?$`));
    if (skippingEmptyProto && protoRequireMatch) {
      const importName = `${packageName}_pb`;
      output.push(
        `import * as ${importName} from '${protoRequireMatch[1]}';`,
        `const proto = { ${packageName}: ${importName}.default || ${importName} };`,
      );
      skippingEmptyProto = false;
      continue;
    }
    skippingEmptyProto = false;

    const requireMatch = line.match(requireLinePattern);
    if (requireMatch) {
      const [, , name, sourcePath] = requireMatch;
      output.push(...toImport(name, sourcePath, false));
      continue;
    }

    if (line.includes(`module.exports = proto.${packageName};`)) {
      output.push(`export default proto.${packageName};`);
      if (uniqueClientNames.length > 0) {
        output.push('export const {');
        for (const clientName of uniqueClientNames) {
          output.push(`  ${clientName},`);
        }
        output.push(`} = proto.${packageName};`);
      }
      continue;
    }

    output.push(line);
  }

  return output.join('\n');
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      yield fullPath;
    }
  }
}

for await (const file of walk(generatedDir)) {
  const source = await readFile(file, 'utf8');
  const packageName = getPackageName(source);
  const needsDefaultExport = !source.includes(`export default proto.${packageName};`);
  const duplicateProtoObject = (source.match(/^const proto = \{\};$/gm) || []).length > 1;
  const duplicatePackageObject = (source.match(new RegExp(`^proto\\.${packageName} = \\{\\};$`, 'gm')) || []).length > 1;
  if (
    !source.includes("require('") &&
    !source.includes('module.exports') &&
    !needsDefaultExport &&
    !duplicateProtoObject &&
    !duplicatePackageObject
  ) {
    continue;
  }

  const converted = file.endsWith('_grpc_web_pb.js')
    ? convertGrpcFile(source)
    : convertMessageFile(source);

  await writeFile(file, converted);
  console.log(`Converted ${path.relative(process.cwd(), file)}`);
}
