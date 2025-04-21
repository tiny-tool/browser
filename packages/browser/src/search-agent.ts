import puppeteer, { Browser } from 'puppeteer';

import baidu from './baidu';
import sougouWeixin from './sougou_weixin';
import browser from './browser';
import { Result } from './define';

const TODOCache = new Map<string, Result>();

export interface SearchOptions {
  resolveUrl?: boolean;
  fullContent?: boolean;
  limit?: number;
}

export class SearchAgent {
  // @ts-ignore
  _browser: Browser;
  constructor() {
    this.init();
  }
  private async init() {
    this._browser = await puppeteer.launch({
      channel: 'chrome',
      headless: false,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
  }
  private async getPage() {
    const page = await this._browser.newPage();
    const ua = (await this._browser.userAgent()).replace('HeadlessChrome/', 'Chrome/');
    await page.setUserAgent(ua);

    return page;
  }
  private async baidu(q: string, options: SearchOptions) {
    const page = await this.getPage();
    const result = await baidu(page, decodeURIComponent(q as string), options);
    page.close();
    return result;
  }
  private async sougouWeixin(q: string, options: SearchOptions) {
    const page = await this.getPage();
    const result = await sougouWeixin(page, decodeURIComponent(q as string), options);
    page.close();
    return result;
  }

  public async search(engine: string, q: string, options: SearchOptions): Promise<Result> {
    const cacheKey = `${engine}_${q}`;

    if (TODOCache.has(cacheKey)) {
      return TODOCache.get(cacheKey)!;
    }

    let result: Result;
    switch (engine) {
      case 'baidu': {
        result = await this.baidu(q, options);
        break;
      }
      case 'sougou_weixin': {
        result = await this.sougouWeixin(q, options);
        break;
      }
      default: {
        throw new Error(`Unknown search engine: ${engine}`);
      }
    }

    TODOCache.set(cacheKey, result);
    return result;
  }

  public async browser(url: string): Promise<string> {
    const page = await this.getPage();
    const content = await browser(page, url);
    page.close();
    return content;
  }
}
