import fs from 'node:fs/promises';
import path from 'node:path';
import Knex from 'knex';

export interface Event {
  id: number;
  event: string;
  session_id: string;
  content: string;
  context: string;
}

export enum EventType {
  SEARCH = 'search',
  BROWSER = 'browser',
  SEARCH_RESULT = 'search_result',
  PAGE_CONTENT = 'page_content',
}

export class Logger {
  // @ts-ignore
  private _knex: Knex.Knex<any, unknown[]>;

  constructor() {}

  public async init(logPath: string) {
    const logsDir = path.join(__dirname, logPath);
    await fs.mkdir(logsDir, { recursive: true });

    this._knex = Knex({
      client: 'better-sqlite3',
      connection: {
        filename: `./${logPath}/db.sqlite3`,
      },
    });

    await this.createEventTable();
  }

  async createEventTable() {
    const exists = await this._knex.schema.hasTable('events');
    if (exists) {
      return;
    }

    await this._knex.schema.createTable('events', function (t) {
      t.increments('id').primary();
      t.text('event');
      t.text('request_id');
      t.text('content');
      t.text('context');
    });
  }

  async event(data: Partial<Event>) {
    await this._knex('events').insert(data);
  }

  createContext(sessionId: string, defaultContext: any): LogContext {
    const logger = this;
    return {
      event: async (data: Partial<Event>, context: any = {}) => {
        const _context = JSON.stringify({ ...defaultContext, ...context });
        await logger.event({ ...data, session_id: sessionId, context: _context });
      },
    };
  }
}

export interface LogContext {
  event(data: Partial<Event>, context?: any): Promise<void>;
}
