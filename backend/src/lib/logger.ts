type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogMeta = Record<string, unknown>;

interface HonoContextLike {
  get(key: string): unknown;
}

const isDev = process.env.NODE_ENV === 'development';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';

function isHonoContext(obj: unknown): obj is HonoContextLike {
  return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>).get === 'function';
}

interface ParsedArgs {
  requestId?: string;
  message: string;
  meta?: LogMeta;
}

function parseArgs(
  ctxOrMsg: unknown,
  message?: string,
  meta?: LogMeta,
): ParsedArgs {
  if (isHonoContext(ctxOrMsg)) {
    return {
      requestId: ctxOrMsg.get('requestId') as string | undefined,
      message: message || '',
      meta,
    };
  }

  if (ctxOrMsg instanceof Error) {
    return {
      message: ctxOrMsg.message,
      meta: { stack: ctxOrMsg.stack, ...(meta || {}) },
    };
  }

  if (typeof ctxOrMsg === 'string') {
    return {
      message: ctxOrMsg,
      meta: message as LogMeta | undefined,
    };
  }

  return { message: '', meta: ctxOrMsg as LogMeta | undefined };
}

function formatDev(level: LogLevel, parsed: ParsedArgs): void {
  const { requestId, message, meta } = parsed;
  const ts = new Date().toISOString();
  const parts: string[] = [
    `${DIM}${ts}${RESET}`,
    `${COLORS[level]}${level.toUpperCase().padEnd(5)}${RESET}`,
  ];
  if (requestId) {
    parts.push(`${DIM}[${requestId}]${RESET}`);
  }
  parts.push(message);

  const fn =
    level === 'error' ? console.error
    : level === 'warn' ? console.warn
    : level === 'debug' ? console.debug
    : console.info;

  fn(parts.join(' '));
  if (meta && Object.keys(meta).length > 0) {
    fn(meta);
  }
}

function formatJson(level: LogLevel, parsed: ParsedArgs): void {
  const { requestId, message, meta } = parsed;
  const entry: LogMeta = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  if (requestId) {
    entry.requestId = requestId;
  }
  if (meta) {
    Object.assign(entry, meta);
  }
  const fn = level === 'error' ? console.error : console.log;
  fn(JSON.stringify(entry));
}

function writeLog(level: LogLevel, parsed: ParsedArgs): void {
  if (isDev) {
    formatDev(level, parsed);
  } else {
    formatJson(level, parsed);
  }
}

export const logger = {
  debug(ctxOrMsg: unknown, message?: string, meta?: LogMeta): void {
    writeLog('debug', parseArgs(ctxOrMsg, message, meta));
  },
  info(ctxOrMsg: unknown, message?: string, meta?: LogMeta): void {
    writeLog('info', parseArgs(ctxOrMsg, message, meta));
  },
  warn(ctxOrMsg: unknown, message?: string, meta?: LogMeta): void {
    writeLog('warn', parseArgs(ctxOrMsg, message, meta));
  },
  error(ctxOrMsg: unknown, message?: string, meta?: LogMeta): void {
    writeLog('error', parseArgs(ctxOrMsg, message, meta));
  },
};
