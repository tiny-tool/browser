import { SearchAgent } from '../search-agent';

async function testBaidu() {
  const agent = new SearchAgent();
  const res = await agent.search('baidu', '杭州天气', {}, { sessionId: 'test' });

  console.log(res);
  return res;
}

testBaidu();
