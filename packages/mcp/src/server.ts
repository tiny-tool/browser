#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { SearchAgent } from '@tiny-tool/browser/agent';
import args from './args';

// Server setup
const server = new Server(
  {
    name: '@tiny-tool/browser-mcp',
    version: '2.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const BrowserSchema = z.object({
  url: z.string(),
});

const SearchSchema = z.object({
  keyword: z.string(),
});

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'browser',
        description: 'Retrieve the content of a webpage from a URL',
        inputSchema: zodToJsonSchema(BrowserSchema) as ToolInput,
      },
      {
        name: 'search',
        description: 'Search for content related to a specified keyword on the internet',
        inputSchema: zodToJsonSchema(SearchSchema) as ToolInput,
      },
    ],
  };
});

const agent = new SearchAgent({ headless: !args.disableHeadless });

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'browser': {
        const parsed = BrowserSchema.safeParse(args);
        const content = await agent.browser(parsed.data?.url!);

        return {
          content: [{ type: 'text', text: content }],
        };
      }
      case 'search': {
        const parsed = SearchSchema.safeParse(args);
        const result = await agent.search('baidu', parsed.data?.keyword!, { fullContent: true, limit: 1, removeInvisibleElements: false });

        return {
          content: result.organic_results.map((item) => {
            return {
              type: 'text',
              text: item.full_content,
            };
          }),
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

export default server;
