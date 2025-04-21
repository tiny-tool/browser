import { Page } from 'puppeteer';
import { extractContent } from '../common/extractor-content';

export default async function browser(page: Page, url: string): Promise<string> {
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 10000,
  });

  const content = await page.evaluate(() => {
    return document.documentElement.innerHTML;
  });

  const result = extractContent(content);
  return result;
}
