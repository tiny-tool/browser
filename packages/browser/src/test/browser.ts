import { SearchAgent } from '../search-agent';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testBrowser() {
  const agent = new SearchAgent();

  await sleep(5000);
  const res = await agent.browser('https://wap.weather.com.cn/mweather15d/101210101.shtml', { sessionId: 'test' });

  console.log('browser res', res);
  return res;
}

testBrowser();
