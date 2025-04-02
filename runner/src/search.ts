import puppeteer, { Browser } from "puppeteer";

import baidu from "./baidu";
import sougouWeixin from "./sougou_weixin";

export class SearchAgent {
  browser: Browser;
  constructor() {
    this.init();
  }
  async init() {
    this.browser = await puppeteer.launch({
      channel: "chrome",
      headless: true,
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });
  }
  async getPage() {
    const page = await this.browser.newPage();
    const ua = (await this.browser.userAgent()).replace(
      "HeadlessChrome/",
      "Chrome/"
    );
    await page.setUserAgent(ua);

    return page;
  }
  async baidu(q: string) {
    const page = await this.getPage();
    const result = await baidu(page, decodeURIComponent(q as string), {});
    page.close();
    return result;
  }
  async sougouWeixin(q: string) {
    const page = await this.getPage();
    const result = await sougouWeixin(
      page,
      decodeURIComponent(q as string),
      {}
    );
    page.close();
    return result;
  }
}
