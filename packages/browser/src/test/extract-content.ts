import { extractContent } from '../common/extractor-content';
import fs from 'node:fs/promises';

async function testExtractContent() {
  const content = await extractContent(await fs.readFile('./src/test/test.html', 'utf-8'));
  console.log('extracted content', content);
  return content;
}

testExtractContent();
