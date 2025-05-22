import fs from 'node:fs/promises';
import path from 'node:path';
import Knex from 'knex';
import { DateTime } from 'luxon';

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
  // @ts-ignore
  private logPath: string;

  constructor() {}

  public async init(logPath: string) {
    this.logPath = logPath;
    await fs.mkdir(logPath, { recursive: true });

    this._knex = Knex({
      client: 'better-sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: path.join(this.logPath, 'db.sqlite3'),
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
      t.text('session_id');
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
      async saveFile(func: () => Promise<Uint8Array>) {
        const fileContent = await func();
        const dt = DateTime.now();

        const dirName = dt.toFormat('yyyyMMdd');
        const logDir = path.join(logger.logPath, dirName, sessionId);
        await fs.mkdir(logDir, { recursive: true });

        const fileName = `${Date.now()}.png`;
        await fs.writeFile(path.join(logDir, fileName), fileContent);
        return path.join(dirName, sessionId, fileName);
      },
    };
  }
}

// 不打日志的版本
export class LoggerFake extends Logger {
  constructor() {
    super();
  }

  public async init(logPath: string) {}

  async createEventTable() {}

  async event(data: Partial<Event>) {}

  createContext(sessionId: string, defaultContext: any): LogContext {
    return {
      event: async (data: Partial<Event>, context: any = {}) => {},
      async saveFile(func: () => Promise<Uint8Array>) {
        return '';
      },
    };
  }
}

export interface LogContext {
  event(data: Partial<Event>, context?: any): Promise<void>;
  /**
   *
   * @returns 返回的路径是相对于 log 目录的
   */
  saveFile(func: () => Promise<Uint8Array>): Promise<string>;
}
