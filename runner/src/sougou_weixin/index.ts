import { Page } from "puppeteer";
import fs from "fs";
import { OrganicResult } from "../define";
import { extractContent } from "../common/extractor-content";

async function resolveSougouUrlAndContent(
  page: Page,
  url: string
): Promise<{
  link: string;
  content: string;
}> {
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 3000 });
  } catch (error) {}
  const link = page.url();
  const content = await page.content();
  return { link, content };
}

async function extractOrganicResults(page: Page): Promise<OrganicResult[]> {
  fs.writeFileSync("sougou.html", await page.content());
  const resultList = await page.$$(".news-list li");

  const ret: OrganicResult[] = [];

  let pos = 0;
  for (const el of resultList) {
    pos++;
    let currentPosition = pos;
    const title = await el.$(".txt-box h3 a");
    if (!title) {
      continue;
    }
    const titleContent = await title.evaluate((el) => el.textContent);
    if (!titleContent) {
      continue;
    }

    const site = await el.$(".s-p .all-time-y2");
    const siteContent = site ? await site.evaluate((el) => el.textContent) : "";

    const linkContent = await title.evaluate((el) => el.href);

    const content = (await el.$("p.txt-info"))!;
    const contentContent = content
      ? await content.evaluate((el) => el.textContent)
      : "";

    ret.push({
      title: titleContent || "",
      displayed_link: siteContent || "",
      link: linkContent || "",
      snippet: contentContent || "",
      position: currentPosition,
      full_content: "",
    });
  }

  return ret;
}

const DefaultOptions = {
  resolveUrl: true,
  fullContent: false,
  limit: 10,
};

export default async function sougouWeixin(
  page: Page,
  keyword: string,
  _options: {
    resolveUrl?: boolean;
    fullContent?: boolean;
    limit?: number;
  }
) {
  const options = { ...DefaultOptions, ..._options };

  await page.goto(
    "https://weixin.sogou.com/weixin?ie=utf8&s_from=input&_sug_=n&_sug_type_=1&type=2&query=" +
      encodeURIComponent(keyword),
    {
      waitUntil: "networkidle0",
      timeout: 10000,
    }
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
      const { link, content } = await resolveSougouUrlAndContent(
        page,
        item.link
      );
      item.link = link;
      if (options.fullContent) {
        item.full_content = await extractContent(content);
      }
    }
  }

  return result;
}
