#!/usr/bin/env node

import { parseArgs } from './args';
import sse from './sse';
import stdio from './stdio';
import streamable from './streamable';

async function main() {
  const args = parseArgs();
  switch (args.type) {
    case 'sse':
      sse(args.config, args.agentConfig);
      break;
    case 'streamable':
      streamable(args.config, args.agentConfig);
      break;
    case 'stdio':
      stdio(args.agentConfig);
      break;
  }
}
main();
