import express from 'express';
import { SearchAgent } from './search-agent';

const app = express();
const port = 3000;

let agent: SearchAgent;

function isTrue(value: any) {
  return value === 'true' || value === '1' || value === true;
}

function getQueryNum(value: string | undefined, defaultValue: number = 10): number {
  if (value === undefined) {
    return defaultValue;
  }
  const num = parseInt(value);
  if (isNaN(num)) {
    return defaultValue;
  }
  return num;
}

app.get('/api/v1/search', async (req, res) => {
  const { q, engine, resolve_url, full_content, num } = req.query;

  const payload = {
    resolveUrl: isTrue(resolve_url),
    fullContent: isTrue(full_content),
    limit: getQueryNum(num as string, 10),
  };
  console.log('req.query', req.query);
  res.send(
    await agent.search(engine as string, decodeURIComponent(q as string), payload, {
      sessionId: req.query.sessionId as string,
    }),
  );
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
  agent = new SearchAgent();
});
