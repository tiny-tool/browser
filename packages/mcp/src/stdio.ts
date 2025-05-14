import { AgentConfig } from '@tiny-tool/browser/agent';
import { createServer } from './server';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export default async function (agentConfig: AgentConfig) {
  const server = createServer(agentConfig);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
