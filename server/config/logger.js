/**
 * config/logger.js
 * Lightweight structured logger — colorised in dev, plain JSON-friendly in prod.
 * No external deps required. Drop-in for console.log everywhere in the app.
 */

'use strict';

const LEVELS  = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const COLORS  = {
  error: '\x1b[31m',  // red
  warn:  '\x1b[33m',  // yellow
  info:  '\x1b[32m',  // green
  http:  '\x1b[36m',  // cyan
  debug: '\x1b[35m',  // magenta
};
const RESET = '\x1b[0m';
const BOLD  = '\x1b[1m';

const ENV_LEVEL = (process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')).toLowerCase();

const logger = {
  _log(level, message, meta) {
    if (LEVELS[level] === undefined || LEVELS[level] > (LEVELS[ENV_LEVEL] ?? 4)) return;

    const ts      = new Date().toISOString();
    const color   = COLORS[level] || '';
    const metaStr = meta && Object.keys(meta).length
      ? '  ' + JSON.stringify(meta)
      : '';

    if (process.env.NODE_ENV === 'production') {
      // Structured JSON for log aggregators (Datadog, CloudWatch, etc.)
      console.log(JSON.stringify({ ts, level, message, ...meta }));
    } else {
      const levelPad = level.toUpperCase().padEnd(5);
      console.log(`${color}${BOLD}[${levelPad}]${RESET}${color} ${ts.slice(11, 23)}${RESET}  ${message}${metaStr}`);
    }
  },

  error: (msg, meta) => logger._log('error', msg, meta),
  warn:  (msg, meta) => logger._log('warn',  msg, meta),
  info:  (msg, meta) => logger._log('info',  msg, meta),
  http:  (msg, meta) => logger._log('http',  msg, meta),
  debug: (msg, meta) => logger._log('debug', msg, meta),
};

module.exports = logger;
