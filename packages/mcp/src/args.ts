import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AgentConfig, SearchOptions } from '@tiny-tool/browser/agent';

export interface Args {
  type: 'sse' | 'stdio' | 'streamable';
  config: {
    port: number;
  };
  agentConfig: AgentConfig;
  searchConfig: SearchOptions;
}

export function parseArgs(): Args {
  const args = yargs(hideBin(process.argv))
    .env('browser_mcp')
    .config()
    .option('type', {
      alias: 't',
      type: 'string',
      default: 'stdio',
      choices: ['sse', 'stdio', 'streamable'],
      description: 'Specify the type (sse/stdio) of server',
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      default: 3000,
      description: 'Specify the port for the server',
    })
    .option('headless', {
      type: 'boolean',
      default: true,
    })
    .option('removeInvisibleElements', {
      type: 'boolean',
      default: false,
    })
    .option('fullContent', {
      type: 'boolean',
      default: true,
    })
    .option('limit', {
      type: 'number',
      default: 1,
    })
    .option('log', {
      type: 'string',
    })
    .parseSync();

  const agentConfig: AgentConfig = {
    headless: true,
    log: args.log,
  };

  if (args.headless === false) {
    agentConfig.headless = false;
  }

  const searchConfig: SearchOptions = {
    removeInvisibleElements: args.removeInvisibleElements,
    fullContent: args.fullContent,
    limit: args.limit,
  };

  return {
    type: args.type as 'sse' | 'stdio' | 'streamable',
    config: {
      port: args.port,
    },
    agentConfig,
    searchConfig,
  };
}
