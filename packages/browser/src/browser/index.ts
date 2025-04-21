import { Page } from 'puppeteer';
import { extractContent } from '../common/extractor-content';
import fs from 'fs';

export default async function browser(page: Page, url: string): Promise<string> {
  await page.goto(url, {
    waitUntil: 'networkidle0',
    timeout: 10000,
  });

  const content = await page.evaluate(() => {
    function isInvisible(el: Element) {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || rect.width === 0 || rect.height === 0;
    }

    function removeInvisibleElements() {
      const allElements = document.querySelectorAll('body *');
      allElements.forEach((el) => {
        if (isInvisible(el)) {
          el.remove();
        }
      });
    }

    removeInvisibleElements();

    return document.documentElement.innerHTML;
  });

  fs.writeFileSync('content.html', content, 'utf-8');
  const result = await extractContent(content);
  return result;
}
