#!/usr/bin/env node

import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import server from './server';

export default async function (config: { port: number }) {
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

  app.listen(config.port);
}
