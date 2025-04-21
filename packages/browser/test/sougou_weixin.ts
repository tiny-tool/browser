import { SearchAgent } from '../src/search-agent';

async function testSougouWeixin() {
  const agent = new SearchAgent();
  const res = await agent.search('sougou_weixin', '杭州天气', {});

  console.log(res);
  return res;
}

testSougouWeixin();
