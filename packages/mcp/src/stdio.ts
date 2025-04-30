import server from './server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export default async function () {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
