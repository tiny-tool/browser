#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import express from 'express';
import { SearchAgent } from '@tiny-tool/browser/agent';

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

const agent = new SearchAgent();

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
        const result = await agent.search('baidu', parsed.data?.keyword!, { fullContent: true, limit: 3 });

        return {
          content: result.organic_results.map((item) => {
            return { type: 'text', text: `${item.title}\n\n${item.snippet}\n\n${item.full_content}` };
          }),
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

const connections = new Map<string, SSEServerTransport>();

const app = express();
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/messages', res);

  const sessionId = transport.sessionId;
  console.log(`[${new Date().toISOString()}] 新的SSE连接建立: ${sessionId}`);
  connections.set(sessionId, transport);

  req.on('close', () => {
    console.log(`[${new Date().toISOString()}] SSE连接关闭: ${sessionId}`);
    connections.delete(sessionId);
  });

  // 将传输对象与MCP服务器连接
  await server.connect(transport);
  console.log(`[${new Date().toISOString()}] MCP服务器连接成功: ${sessionId}`);
});

app.post('/messages', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] 收到客户端消息:`, req.query);
    const sessionId = req.query.sessionId as string;

    // 查找对应的SSE连接并处理消息
    if (connections.size > 0) {
      const transport: SSEServerTransport = connections.get(sessionId) as SSEServerTransport;
      // 使用transport处理消息
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        throw new Error('没有活跃的SSE连接');
      }
    } else {
      throw new Error('没有活跃的SSE连接');
    }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] 处理客户端消息失败:`, error);
    res.status(500).json({ error: '处理消息失败', message: error.message });
  }
});

app.listen(3002);
