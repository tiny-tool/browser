import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    app: "src/app.ts",
    test_baidu: "test/baidu.ts",
    test_sougou_weixin: "test/sougou_weixin.ts",
  },
});
