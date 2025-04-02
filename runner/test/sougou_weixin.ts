import sougouWeixin from "../src/sougou_weixin";

async function testBaidu() {
  const res = await sougouWeixin("杭州天气", {
    resolveUrl: false,
  });

  console.log(res);
}

testBaidu();
