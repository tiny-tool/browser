import { Page } from 'puppeteer';
import { OrganicResult, Result } from '../define';
import { getRedirectUrl } from '../common/get-redirect-url';
import browser from '../browser';

async function resolveBaiduUrlAndContent(
  page: Page,
  url: string,
): Promise<{
  link: string;
  content: string;
}> {
  const content = await browser(page, url);
  const link = page.url();

  return { link, content };
}

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

const DefaultOptions = {
  resolveUrl: true,
  fullContent: false,
  limit: 10,
};

export default async function baidu(
  page: Page,
  keyword: string,
  _options: {
    resolveUrl?: boolean;
    fullContent?: boolean;
    limit?: number;
  },
): Promise<Result> {
  const options = { ...DefaultOptions, ..._options };

  await page.goto('https://www.baidu.com/s?wd=' + encodeURIComponent(keyword), {
    waitUntil: 'networkidle0',
    timeout: 10000,
  });

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
        const { link, content } = await resolveBaiduUrlAndContent(page, item.link);
        item.link = link;
        item.full_content = content;
      }
    } else {
      for (const item of result.organic_results) {
        await getRedirectUrl(item.link);
      }
    }
  }

  console.log('baidu result', result);
  return result;
}
