import { Page } from 'puppeteer-core';
import { OrganicResult, Result, SearchOptions } from '../define';
import { getRedirectUrl } from '../common/get-redirect-url';
import { EventType, LogContext } from '../logs';
import { resolveUrlAndContent } from '../common/get-page-content';

async function extractOrganicResults(page: Page): Promise<OrganicResult[]> {
  const resultList = await page.$$('.result.c-container.new-pmd');

  const ret: OrganicResult[] = [];

  let pos = 0;
  for (const el of resultList) {
    pos++;
    let currentPosition = pos;
    const title = await el.$('.c-title');
    if (!title) {
      continue;
    }
    const titleContent = await title.evaluate((el) => el.textContent);
    if (!titleContent) {
      continue;
    }

    // const site = await el.$('div[class^="source_"] a[class^="siteLink_"]');
    const site = await el.$('a[class^="siteLink_"]');
    const siteContent = site ? await site.evaluate((el) => el.textContent) : '';

    const link = (await el.$('.c-title a'))!;
    const linkContent = await link.evaluate((el) => el.href);

    const content = (await el.$('span[class^="content-right"]'))!;
    const contentContent = content ? await content.evaluate((el) => el.textContent) : '';

    ret.push({
      title: titleContent || '',
      displayed_link: siteContent || '',
      link: linkContent || '',
      snippet: contentContent || '',
      position: currentPosition,
      full_content: '',
    });
  }

  return ret;
}

const DefaultOptions: SearchOptions = {
  resolveUrl: true,
  fullContent: false,
  limit: 10,
  removeInvisibleElements: true,
};

export default async function baidu(page: Page, keyword: string, _options: SearchOptions, logContext: LogContext): Promise<Result> {
  const options = { ...DefaultOptions, ..._options };

  try {
    await page.goto('https://www.baidu.com/s?wd=' + encodeURIComponent(keyword), {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });
  } catch (error) {}

  const screenshotFile = await logContext.saveFile(async () => {
    return page.screenshot({ type: 'webp', quality: 90 });
  });

  await logContext.event(
    {
      event: EventType.SEARCH_RESULT,
      content: await page.content(),
    },
    {
      url: page.url(),
      options: options,
      screenshotFile,
    },
  );

  const result: Result = {
    organic_results: [] as OrganicResult[],
  };

  result.organic_results = await extractOrganicResults(page);
  if (options.limit) {
    result.organic_results = result.organic_results.slice(0, options.limit);
  }

  if (options.resolveUrl) {
    if (options.fullContent) {
      for (const item of result.organic_results) {
        const { link, content } = await resolveUrlAndContent(
          page,
          item.link,
          {
            removeInvisibleElements: options.removeInvisibleElements!,
          },
          logContext,
        );
        item.link = link;
        item.full_content = content;
      }
    } else {
      for (const item of result.organic_results) {
        await getRedirectUrl(item.link);
      }
    }
  }

  return result;
}
