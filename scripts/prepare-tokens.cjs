const StyleDictionary = require('style-dictionary');

StyleDictionary.registerFormat({
  name: 'mdx/custom-format',
  formatter: function ({ dictionary }) {
    const tokenRows = dictionary.allTokens.map(token => {
      const value = String(token.value ?? '');
      const type = token.type || token.attributes?.category || '';
      const description = token.comment || token.description || '';
      const isColor =
        type === 'color' ||
        value.startsWith('#') ||
        value.startsWith('rgb') ||
        value.startsWith('hsl');
      const preview = isColor
        ? `<span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: '${value}', border: '1px solid #ccc', borderRadius: '4px' }}></span>`
        : '';
      return `| ${token.name} | \`${value}\` | ${preview} | ${description} |`;
    }).join('\n');
    return `# Design Tokens
이 문서는 JSON 토큰에서 자동으로 생성되었습니다.

| Name | Value | Preview | Description |
| :--- | :--- | :--- | :--- |
${tokenRows}
`;
  }
});

const sd = StyleDictionary.extend('./config/style-dictionary.config.json');

console.log('Build starting...');
sd.buildAllPlatforms();
console.log('Build completed! Check build/docs folder.');