import express from "express";
import { SearchAgent } from "./search";

const app = express();
const port = 3000;

let agent: SearchAgent;

app.get("/api/v1/search", async (req, res) => {
  const { q, engine } = req.query;
  switch (engine) {
    case "baidu": {
      res.send(await agent.baidu(decodeURIComponent(q as string)));
      return;
    }
    case "sougou_weixin": {
      res.send(await agent.sougouWeixin(decodeURIComponent(q as string)));
      return;
    }
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
  agent = new SearchAgent();
});
