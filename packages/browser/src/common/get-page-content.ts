import { Page } from 'puppeteer-core';
import browser from '../browser';
import { EventType, LogContext } from '../logs';

export async function resolveUrlAndContent(
  page: Page,
  url: string,
  options: {
    removeInvisibleElements: boolean;
  },
  logContext: LogContext,
): Promise<{
  link: string;
  content: string;
}> {
  const content = await browser(page, url, options, logContext);
  const link = page.url();

  return { link, content };
}
