#!/usr/bin/env node

import { parseArgs } from './args';
import sse from './sse';
import stdio from './stdio';
import streamable from './streamable';

async function main() {
  const args = parseArgs();
  switch (args.type) {
    case 'sse':
      sse(args);
      break;
    case 'streamable':
      streamable(args);
      break;
    case 'stdio':
      stdio(args);
      break;
  }
}
main();
