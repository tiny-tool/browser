import { Page } from 'puppeteer-core';
import { extractContent } from '../common/extractor-content';
import { EventType, LogContext } from '../logs';

export default async function browser(page: Page, url: string, options: { removeInvisibleElements: boolean }, logContext: LogContext): Promise<string> {
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });
  } catch (error) {}

  await logContext.event(
    {
      event: EventType.PAGE_CONTENT,
      content: await page.content(),
    },
    {
      url: page.url(),
      options: options,
    },
  );

  const content = await page.evaluate((options) => {
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

    if (options.removeInvisibleElements) {
      removeInvisibleElements();
    }

    return document.documentElement.innerHTML;
  }, options);

  const result = await extractContent(content);
  return result;
}
