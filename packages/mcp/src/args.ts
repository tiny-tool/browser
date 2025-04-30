import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
  .option('type', {
    alias: 't',
    type: 'string',
    default: 'stdio',
    choices: ['sse', 'stdio'],
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
  .parseSync();

export default args;
