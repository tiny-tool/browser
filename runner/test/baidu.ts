import baidu from "../src/baidu";

async function testBaidu() {
  const res = await baidu("杭州天气", {});

  console.log(res);
}

testBaidu();
