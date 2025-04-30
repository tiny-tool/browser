#!/usr/bin/env node

import args from './args';
import sse from './sse';
import stdio from './stdio';
import streamable from './streamable';

switch (args.type) {
  case 'sse':
    sse({
      port: args.port,
    });
    break;
  case 'streamable':
    streamable({
      port: args.port,
    });
    break;
  case 'stdio':
    stdio();
    break;
}
