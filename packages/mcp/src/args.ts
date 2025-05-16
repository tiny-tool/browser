import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { AgentConfig } from '@tiny-tool/browser/agent';

export function parseArgs() {
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
    .option('disableHeadless', {
      type: 'boolean',
      default: false,
    })
    .option('log', {
      type: 'string',
      default: 'logs',
    })
    .parseSync();

  const agentConfig: AgentConfig = {
    headless: true,
    log: args.log,
  };

  if (args.disableHeadless) {
    agentConfig.headless = false;
  }

  return {
    type: args.type,
    config: {
      port: args.port,
    },
    agentConfig,
  };
}
