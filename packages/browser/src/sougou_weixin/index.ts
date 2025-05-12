import { Page } from 'puppeteer-core';
import { OrganicResult, Result, SearchOptions } from '../define';
import { getRedirectUrl } from '../common/get-redirect-url';
import { EventType, LogContext } from '../logs';
import { resolveUrlAndContent } from '../common/get-page-content';

async function extractOrganicResults(page: Page): Promise<OrganicResult[]> {
  const resultList = await page.$$('.news-list li');

  const ret: OrganicResult[] = [];

  let pos = 0;
  for (const el of resultList) {
    pos++;
    let currentPosition = pos;
    const title = await el.$('.txt-box h3 a');
    if (!title) {
      continue;
    }
    const titleContent = await title.evaluate((el) => el.textContent);
    if (!titleContent) {
      continue;
    }

    const site = await el.$('.s-p .all-time-y2');
    const siteContent = site ? await site.evaluate((el) => el.textContent) : '';

    const linkContent = await title.evaluate((el) => el.href);

    const content = (await el.$('p.txt-info'))!;
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

export default async function sougouWeixin(page: Page, keyword: string, _options: SearchOptions, logContext: LogContext): Promise<Result> {
  const options = { ...DefaultOptions, ..._options };

  try {
    await page.goto('https://weixin.sogou.com/weixin?ie=utf8&s_from=input&_sug_=n&_sug_type_=1&type=2&query=' + encodeURIComponent(keyword), {
      waitUntil: 'networkidle0',
      timeout: 10000,
    });
  } catch (error) {}

  await logContext.event(
    {
      event: EventType.SEARCH_RESULT,
      content: await page.content(),
    },
    {
      url: page.url(),
      options: options,
    },
  );

  const result = {
    organic_results: [] as OrganicResult[],
  };

  result.organic_results = await extractOrganicResults(page);
  if (options.limit) {
    result.organic_results = result.organic_results.slice(0, options.limit);
  }

  if (options.resolveUrl) {
    for (const item of result.organic_results) {
      if (options.fullContent) {
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
      } else {
        const redirectUrl = await getRedirectUrl(item.link);
        item.link = redirectUrl;
      }
    }
  }

  return result;
}
