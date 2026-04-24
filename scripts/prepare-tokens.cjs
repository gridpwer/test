const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'tokens', 'tokens.json');
const outputPath = path.join(root, 'config', 'generated.tokens.json');

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const primitiveSet = source['primitive/value-set'];

if (!primitiveSet || typeof primitiveSet !== 'object') {
  throw new Error('Missing "primitive/value-set" in tokens/tokens.json');
}

const normalized = {
  ...source,
};

for (const [key, value] of Object.entries(primitiveSet)) {
  if (normalized[key] === undefined) {
    normalized[key] = value;
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`);
