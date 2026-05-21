const StyleDictionary = require('style-dictionary').default;
const fs = require('node:fs');
const path = require('node:path');

const sourceTokensPath = path.join(__dirname, '..', 'tokens', 'tokens.json');
const generatedTokensPath = path.join(__dirname, '..', 'config', 'generated.tokens.json');

function stripFigmaMetadata(value) {
  if (Array.isArray(value)) {
    return value.map(stripFigmaMetadata);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$'))
        .map(([key, childValue]) => [key, stripFigmaMetadata(childValue)]),
    );
  }

  return value;
}

function prepareTokens(tokens) {
  const strippedTokens = stripFigmaMetadata(tokens);
  const { 'primitive/value-set': primitiveValueSet, ...tokenSets } = strippedTokens;

  return {
    ...(primitiveValueSet || {}),
    ...tokenSets,
  };
}

function markdownCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|');
}

function tokenRows(dictionary, { includePreview }) {
  return dictionary.allTokens.map(token => {
    const value = String(token.value ?? '');
    const type = token.type || token.attributes?.category || '';
    const description = token.comment || token.description || '';
    const isColor =
      type === 'color' ||
      value.startsWith('#') ||
      value.startsWith('rgb') ||
      value.startsWith('hsl');
    const preview = includePreview && isColor
      ? `<span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '${value}', border: '1px solid #ccc', borderRadius: '4px' }}></span>`
      : '';

    return `| ${markdownCell(token.name)} | \`${markdownCell(value)}\` | ${preview} | ${markdownCell(description)} |`;
  }).join('\n');
}

StyleDictionary.registerFormat({
  name: 'markdown/table',
  format: function ({ dictionary }) {
    return `# Design Tokens
Generated automatically from JSON design tokens.

| Name | Value | Preview | Description |
| :--- | :--- | :--- | :--- |
${tokenRows(dictionary, { includePreview: false })}
`;
  }
});

StyleDictionary.registerFormat({
  name: 'mdx/custom-format',
  format: function ({ dictionary }) {
    return `# Design Tokens
Generated automatically from JSON design tokens.

| Name | Value | Preview | Description |
| :--- | :--- | :--- | :--- |
${tokenRows(dictionary, { includePreview: true })}
`;
  }
});

async function main() {
  const sourceTokens = JSON.parse(fs.readFileSync(sourceTokensPath, 'utf8'));
  const generatedTokens = prepareTokens(sourceTokens);

  fs.mkdirSync(path.dirname(generatedTokensPath), { recursive: true });
  fs.writeFileSync(generatedTokensPath, `${JSON.stringify(generatedTokens, null, 2)}\n`);

  const sd = new StyleDictionary('./config/style-dictionary.config.json');

  console.log('Build starting...');
  await sd.buildAllPlatforms();
  console.log('Build completed! Check build/docs folder.');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
