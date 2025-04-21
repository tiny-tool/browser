import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      syntax: ['node 20'],
      format: 'cjs',
    },
    {
      syntax: ['node 20'],
      format: 'esm',
      dts: true,
    },
  ],
  source: {
    entry: {
      app: './src/app.ts',
      agent: './src/search-agent.ts',
    },
  },
});
