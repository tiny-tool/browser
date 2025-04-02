import express from "express";
import baidu from "./baidu";
import sougouWeixin from "./sougou_weixin";

const app = express();
const port = 3000;

app.get("/api/v1/search", async (req, res) => {
  const { q, engine } = req.query;
  switch (engine) {
    case "baidu": {
      res.send(await baidu(decodeURIComponent(q as string), {}));
      return;
    }
    case "sougou_weixin": {
      res.send(await sougouWeixin(decodeURIComponent(q as string), {}));
      return;
    }
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
