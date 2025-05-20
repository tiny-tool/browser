import puppeteer, { Browser } from 'puppeteer-core';
import { fullLists, PuppeteerBlocker } from '@ghostery/adblocker-puppeteer';
import fs from 'node:fs/promises';
import path from 'node:path';
import baidu from './baidu';
import sougouWeixin from './sougou_weixin';
import browser from './browser';
import { Result, SearchOptions } from './define';
import { EventType, LogContext, Logger, LoggerFake } from './logs';

const TODOCache = new Map<string, Result>();

export interface AgentConfig {
  headless?: boolean;
  log?: string | false;
}

const DefalutConfig: AgentConfig = {
  headless: true,
  log: '',
};

async function checkFileExists(fpath: string) {
  try {
    await fs.access(fpath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureAdblockPath() {
  if (await checkFileExists('dist')) {
    return path.join('.', 'dist', 'adblock.bin');
  }
  await fs.mkdir('node_modules', { recursive: true });

  return path.join('.', 'node_modules', 'adblock.bin');
}

interface SessionContext {
  sessionId: string;
}

export class SearchAgent {
  // @ts-ignore
  _browser: Browser;
  _browserInited: Promise<void>;
  // @ts-ignore
  _browserInitCallback: Function;
  // @ts-ignore
  _blocker: PuppeteerBlocker;
  // @ts-ignore
  _logger: Logger;
  config: AgentConfig;
  baiduInited = false;
  constructor(config: AgentConfig = {}) {
    this.config = Object.assign({}, DefalutConfig, config);
    this._browserInited = new Promise((resolve) => {
      this._browserInitCallback = resolve;
    });
    this.init();
  }
  private async init() {
    if (this.config.log) {
      this._logger = new Logger();
    } else {
      this._logger = new LoggerFake();
    }
    await this._logger.init('logs');

    this._browser = await puppeteer.launch({
      channel: 'chrome',
      headless: this.config.headless,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
    this._browserInitCallback();

    this._blocker = await PuppeteerBlocker.fromLists(
      fetch,
      fullLists,
      {
        enableCompression: true,
      },
      {
        path: await ensureAdblockPath(),
        read: fs.readFile,
        write: fs.writeFile,
      },
    );
  }
  private async getPage() {
    await this._browserInited;
    const page = await this._browser.newPage();
    const ua = (await this._browser.userAgent()).replace('HeadlessChrome/', 'Chrome/');
    await page.setUserAgent(ua);

    if (this._blocker) {
      // @ts-ignore
      await this._blocker.enableBlockingInPage(page);
    }

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
  private async baidu(q: string, options: SearchOptions, logContext: LogContext) {
    await this.initBaidu();
    const page = await this.getPage();
    const result = await baidu(page, decodeURIComponent(q as string), options, logContext);
    page.close();
    return result;
  }
  private async sougouWeixin(q: string, options: SearchOptions, logContext: LogContext) {
    const page = await this.getPage();
    const result = await sougouWeixin(page, decodeURIComponent(q as string), options, logContext);
    page.close();
    return result;
  }

  public async search(engine: string, q: string, options: SearchOptions, context: SessionContext): Promise<Result> {
    await this._browserInited;
    const logContext = this._logger.createContext(context.sessionId, {
      engine,
      q,
      input_options: options,
    });

    logContext.event({
      event: EventType.SEARCH,
      content: JSON.stringify({
        engine,
        q,
        options,
      }),
    });

    const cacheKey = `${engine}_${q}`;

    if (TODOCache.has(cacheKey)) {
      return TODOCache.get(cacheKey)!;
    }

    let result: Result;
    switch (engine) {
      case 'baidu': {
        result = await this.baidu(q, options, logContext);
        break;
      }
      case 'sougou_weixin': {
        result = await this.sougouWeixin(q, options, logContext);
        break;
      }
      default: {
        throw new Error(`Unknown search engine: ${engine}`);
      }
    }

    TODOCache.set(cacheKey, result);
    return result;
  }

  public async browser(url: string, context: SessionContext): Promise<string> {
    const page = await this.getPage();

    const logContext = this._logger.createContext(context.sessionId, {
      url,
    });

    logContext.event({
      event: EventType.BROWSER,
      content: JSON.stringify({
        url,
      }),
    });

    const content = await browser(page, url, { removeInvisibleElements: false }, logContext);
    page.close();
    return content;
  }
}

export type { Result, SearchOptions };
