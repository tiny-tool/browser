import puppeteer, { Browser } from 'puppeteer-core';

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

export interface AgentConfig {
  headless?: boolean;
}

export class SearchAgent {
  // @ts-ignore
  _browser: Browser;
  _browserInited: Promise<void>;
  // @ts-ignore
  _browserInitCallback: Function;
  config: AgentConfig;
  baiduInited = false;
  constructor(config: AgentConfig = { headless: true }) {
    this.config = config;
    this._browserInited = new Promise((resolve) => {
      this._browserInitCallback = resolve;
    });
    this.init();
  }
  private async init() {
    this._browser = await puppeteer.launch({
      channel: 'chrome',
      headless: this.config.headless,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
    this._browserInitCallback();
  }
  private async getPage() {
    await this._browserInited;
    const page = await this._browser.newPage();
    const ua = (await this._browser.userAgent()).replace('HeadlessChrome/', 'Chrome/');
    await page.setUserAgent(ua);

    return page;
  }
  private async initBaidu() {
    if (this.baiduInited) {
      return;
    }
    const page = await this.getPage();
    try {
      await page.goto('https://www.baidu.com', {
        waitUntil: 'networkidle0',
        timeout: 10000,
      });
    } catch (error) {}
    page.close();

    this.baiduInited = true;
  }
  private async baidu(q: string, options: SearchOptions) {
    await this.initBaidu();
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
