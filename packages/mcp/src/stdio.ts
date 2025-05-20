import { createServer } from './server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Args } from './args';

export default async function (args: Args) {
  const server = createServer(args);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
